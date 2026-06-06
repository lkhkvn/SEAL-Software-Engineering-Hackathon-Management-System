import sys

with open('d:/SEAL/SEAL-Software-Engineering-Hackathon-Management-System/SEAL/backend/public/index.php', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
for line in lines:
    out.append(line)
    if 'use App\Services\AuthService;' in line:
        out.append('use App\Services\TeamService;\n')
        out.append('use App\Infrastructure\Persistence\DoctrineTeamRepository;\n')
        out.append('use App\DTO\CreateTeamRequestDTO;\n')
        out.append('use App\DTO\JoinTeamRequestDTO;\n')
        out.append('use App\DTO\MatchTeamRequestDTO;\n')
    
    if '$authService = new AuthService($userRepository);' in line:
        out.append('    $teamRepository = new DoctrineTeamRepository($entityManager);\n')
        out.append('    $teamService = new TeamService($teamRepository, $entityManager);\n')
    
    if '// LỖI 404: KHÔNG TÌM THẤY ENDPOINT PHÙ HỢP' in line:
        routes = """
    // ------------------------------------------------------------------------
    // API TEAM FORMATION (TẠO, THAM GIA, TÌM ĐỘI)
    // ------------------------------------------------------------------------
    if ($path === '/api/teams' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }
        $currentUser = $authService->verifyToken($matches[1]);
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $dto = new CreateTeamRequestDTO(
            $inputData['name'] ?? '',
            $inputData['category'] ?? 'General',
            $currentUser->id
        );
        $result = $teamService->createTeam($dto, $currentUser);
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Tạo đội thi thành công!", "data" => $result], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    if ($path === '/api/teams/join' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }
        $currentUser = $authService->verifyToken($matches[1]);
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $dto = new JoinTeamRequestDTO($inputData['joinCode'] ?? '');
        $result = $teamService->joinTeam($dto, $currentUser);
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Tham gia đội thi thành công!", "data" => $result], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    if ($path === '/api/teams/match' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }
        $currentUser = $authService->verifyToken($matches[1]);
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $inputData['isLookingForTeam'] ?? false;
        
        $teamService->toggleLookingForTeam($currentUser, $status);
        
        $match = null;
        if ($status) {
            $match = $teamService->autoMatch($currentUser);
        }
        
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Cập nhật trạng thái thành công!", "match" => $match], JSON_UNESCAPED_UNICODE);
        exit(0);
    }
"""
        out.pop()
        out.append(routes)
        out.append(line)

with open('d:/SEAL/SEAL-Software-Engineering-Hackathon-Management-System/SEAL/backend/public/index.php', 'w', encoding='utf-8') as f:
    f.writelines(out)
