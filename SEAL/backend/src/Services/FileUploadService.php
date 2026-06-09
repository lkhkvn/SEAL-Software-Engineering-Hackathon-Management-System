<?php

namespace App\Services;

use Exception;

/**
 * Service: FileUploadService
 * Xử lý upload file đề bài cuộc thi (PDF, ZIP, DOCX, RAR).
 */
class FileUploadService
{
    private const ALLOWED_TYPES = [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/vnd.rar',
        'application/octet-stream',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
    ];

    private const ALLOWED_EXTENSIONS = ['pdf', 'zip', 'docx', 'doc', 'rar'];
    private const MAX_SIZE_BYTES     = 20 * 1024 * 1024; // 20MB

    private string $uploadDir;
    private string $publicUrl;

    public function __construct()
    {
        $this->uploadDir = __DIR__ . '/../../public/uploads/challenges/';
        $this->publicUrl = '/uploads/challenges/';
    }

    /**
     * Upload file đề bài cho một cuộc thi.
     *
     * @param array $file  Phần tử từ $_FILES['file']
     * @param int   $contestId
     * @return array{url: string, name: string}
     * @throws Exception
     */
    public function uploadChallengeFile(array $file, int $contestId): array
    {
        // 1. Kiểm tra lỗi upload
        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            $errMessages = [
                UPLOAD_ERR_INI_SIZE   => 'File vượt quá giới hạn upload_max_filesize.',
                UPLOAD_ERR_FORM_SIZE  => 'File vượt quá giới hạn MAX_FILE_SIZE.',
                UPLOAD_ERR_PARTIAL    => 'File chỉ được upload một phần.',
                UPLOAD_ERR_NO_FILE    => 'Không có file nào được upload.',
                UPLOAD_ERR_NO_TMP_DIR => 'Thiếu thư mục tạm trên server.',
                UPLOAD_ERR_CANT_WRITE => 'Không thể ghi file lên server.',
            ];
            $errCode = $file['error'] ?? UPLOAD_ERR_NO_FILE;
            throw new Exception($errMessages[$errCode] ?? 'Lỗi upload không xác định.');
        }

        // 2. Kiểm tra kích thước
        if ($file['size'] > self::MAX_SIZE_BYTES) {
            throw new Exception('File quá lớn! Giới hạn tối đa là 20MB.');
        }

        // 3. Kiểm tra extension
        $originalName = $file['name'];
        $ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXTENSIONS)) {
            throw new Exception('Định dạng file không được hỗ trợ. Cho phép: PDF, ZIP, DOCX, DOC, RAR.');
        }

        // 4. Kiểm tra MIME type thực
        $finfo    = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        if (!in_array($mimeType, self::ALLOWED_TYPES)) {
            // Với RAR/ZIP, mime type có thể khác nhau — chỉ cần extension hợp lệ
            if (!in_array($ext, ['zip', 'rar', 'docx', 'doc'])) {
                throw new Exception('Nội dung file không khớp với định dạng cho phép.');
            }
        }

        // 5. Tạo thư mục theo contestId nếu chưa có
        $contestDir = $this->uploadDir . $contestId . '/';
        if (!is_dir($contestDir)) {
            mkdir($contestDir, 0755, true);
        }

        // 6. Tạo tên file an toàn (tránh trùng, tránh path traversal)
        $safeBase   = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
        $uniqueName = $safeBase . '_' . time() . '.' . $ext;
        $destPath   = $contestDir . $uniqueName;

        // 7. Di chuyển file
        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            throw new Exception('Không thể lưu file lên server. Kiểm tra quyền thư mục uploads/.');
        }

        return [
            'url'  => $this->publicUrl . $contestId . '/' . $uniqueName,
            'name' => $originalName,
        ];
    }
}
