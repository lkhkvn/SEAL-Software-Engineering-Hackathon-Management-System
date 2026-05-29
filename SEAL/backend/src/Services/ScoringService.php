<?php

namespace App\Services;

use App\Domain\Repositories\ScoreRepositoryInterface;
use App\DTO\CreateScoreDTO;
use App\Domain\Entity\Score;
use Exception;

class ScoringService
{
    public function __construct(
        private ScoreRepositoryInterface $scoreRepository
    ) {}

    /**
     * Xử lý logic chấm điểm chi tiết của Giám khảo
     */
    public function submitScore(CreateScoreDTO $dto): void
    {
        // 1. Ràng buộc nghiệp vụ: Điểm số phải nằm trong thang điểm quy định (Ví dụ: 0 - 10)
        if ($dto->scoreValue < 0 || $dto->scoreValue > 10) {
            throw new Exception("Điểm số nhập vào không hợp lệ. Thang điểm phải từ 0 đến 10.");
        }

        // 2. Tạo thực thể Score từ DTO để chuẩn bị lưu xuống
        $score = new Score();
        // Giả lập gán các thuộc tính (Bạn sẽ tinh chỉnh theo các hàm setter sẵn có trong Domain\Entity\Score.php của nhóm)
        $score->setJudgeId($dto->judgeId);
        $score->setTeamId($dto->teamId);
        $score->setCriteriaId($dto->criteriaId);
        $score->setValue($dto->scoreValue);

        // 3. Gọi Repository để thực thi lưu vào cơ sở dữ liệu
        $this->scoreRepository->save($score);
    }
}