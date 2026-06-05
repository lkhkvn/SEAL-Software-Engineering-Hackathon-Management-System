<?php

namespace App\Presentation;

use App\Services\ScoringService;
use App\DTO\CreateScoreDTO;
use App\Domain\Entity\Feedback;
use App\Domain\Repositories\FeedbackRepositoryInterface;
use Exception;

class ScoreController
{
    public function __construct(
        private ScoringService $scoringService,
        private FeedbackRepositoryInterface $feedbackRepository
    ) {}

    public function handleSubmitScore(): void
    {
        header('Content-Type: application/json');
        $inputData = json_decode(file_get_contents('php://input'), true);

        try {
            $dto = CreateScoreDTO::fromArray($inputData);
            $this->scoringService->submitScore($dto);

            echo json_encode([
                'status' => 'success',
                'message' => 'Lưu điểm số của giám khảo thành công!'
            ]);
        } catch (Exception $e) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    public function handleSubmitFeedback(): void
    {
        header('Content-Type: application/json');
        $inputData = json_decode(file_get_contents('php://input'), true);

        try {
            if (empty($inputData['comment'])) {
                throw new Exception("Nội dung nhận xét không được để trống.");
            }

            $feedback = new Feedback();
            $feedback->setJudgeId((int)$inputData['judge_id']);
            $feedback->setTeamId((int)$inputData['team_id']);
            $feedback->setComment($inputData['comment']);

            $this->feedbackRepository->save($feedback);

            echo json_encode([
                'status' => 'success',
                'message' => 'Lưu nhận xét của giám khảo thành công!'
            ]);
        } catch (Exception $e) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
}