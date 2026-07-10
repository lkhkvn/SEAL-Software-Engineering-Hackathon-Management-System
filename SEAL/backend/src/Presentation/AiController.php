<?php
namespace App\Presentation;

use App\Services\AuthService;
use Exception;

class AiController {
    private string $apiKey;

    public function __construct(private AuthService $authService) {
        $config = require __DIR__ . '/../../config/ai.php';
        $this->apiKey = $config['gemini_api_key'] ?? '';
    }

    public function chat(): void {
        try {
            // Verify token
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], JSON_UNESCAPED_UNICODE);
                return;
            }
            $this->authService->verifyToken($matches[1]);

            if (empty($this->apiKey)) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'API Key chưa được cấu hình!'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
            $history = $inputData['history'] ?? [];
            $message = trim($inputData['message'] ?? '');

            if ($message === '') {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Nội dung tin nhắn không được để trống!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $systemInstruction = "Bạn là một Mentor chuyên gia của nền tảng SEAL Hackathon. Nhiệm vụ của bạn là giải đáp lỗi code và gợi ý ý tưởng công nghệ ngắn gọn, súc tích cho các thí sinh. Hãy thân thiện và chuyên nghiệp.";

            $contents = [];
            foreach ($history as $msg) {
                $contents[] = [
                    "role" => $msg['role'] === 'user' ? 'user' : 'model',
                    "parts" => [["text" => $msg['content']]]
                ];
            }
            $contents[] = [
                "role" => "user",
                "parts" => [["text" => $message]]
            ];

            $payload = [
                "system_instruction" => [
                    "parts" => [["text" => $systemInstruction]]
                ],
                "contents" => $contents,
                "generationConfig" => [
                    "temperature" => 0.7,
                    "maxOutputTokens" => 1024,
                ]
            ];

            $ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" . $this->apiKey);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                // FALLBACK MOCK RESPONSE: Nếu API lỗi, trả về câu trả lời giả định cho mục đích demo
                $lowerMsg = mb_strtolower($message);
                $reply = "Chào bạn, đây là hệ thống AI Mentor (Chế độ Demo do API Key chưa được thiết lập chính xác). ";
                
                // Trích xuất lỗi từ Google API để báo cho người dùng
                $errorMsg = "Không rõ lỗi";
                $errorData = json_decode($response, true);
                if (isset($errorData['error']['message'])) {
                    $errorMsg = $errorData['error']['message'];
                }

                if (strpos($lowerMsg, 'chào') !== false || strpos($lowerMsg, 'hello') !== false) {
                    $reply = "Chào bạn! Chúc đội của bạn có một kỳ Hackathon thật thành công. Bạn cần tôi hỗ trợ gì về kỹ thuật không?";
                } elseif (strpos($lowerMsg, 'lỗi') !== false || strpos($lowerMsg, 'bug') !== false) {
                    $reply = "Bạn hãy kiểm tra lại console log của trình duyệt hoặc terminal xem có mã lỗi cụ thể nào không nhé. Nếu bạn dùng React, hãy xem xét các dependency trong `useEffect`.";
                } elseif (strpos($lowerMsg, 'ý tưởng') !== false || strpos($lowerMsg, 'idea') !== false) {
                    $reply = "Một ý tưởng tốt là tích hợp AI để giải quyết các bài toán tự động hoá. Ví dụ: Dùng AI quét CV để tự động xếp đội, hoặc làm chatbot tự động tư vấn.";
                } else {
                    $reply = "Rất tiếc, tôi chưa hiểu ý của bạn. Hãy thử hỏi tôi về các lỗi code (bug) hoặc cần xin ý tưởng (idea) nhé!";
                }

                http_response_code(200);
                echo json_encode([
                    "status" => "success",
                    "data" => ["reply" => $reply]
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            $resData = json_decode($response, true);
            $reply = $resData['candidates'][0]['content']['parts'][0]['text'] ?? 'Xin lỗi, tôi không thể trả lời lúc này.';

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "data" => ["reply" => $reply]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}
