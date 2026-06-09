<?php

namespace App\Services;

use App\Domain\Entity\Challenge;
use App\Domain\Repositories\ChallengeRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Exception;

/**
 * Application Service: ChallengeService
 * Tầng Application/Use-Cases — điều phối nghiệp vụ, không chứa logic DB hay HTTP.
 */
class ChallengeService
{
    public function __construct(
        private readonly ChallengeRepositoryInterface $challengeRepository,
        private readonly EntityManagerInterface       $em   // Dùng raw DBAL để query contests
    ) {}

    // ── USE CASE 1: Admin tạo / cập nhật đề bài ──────────────────────────────

    public function upsert(int $contestId, array $data): array
    {
        $this->assertContestExists($contestId);

        $existing = $this->challengeRepository->findByContestId($contestId);

        if ($existing) {
            // Cập nhật
            $updated = new Challenge(
                id:           $existing->id,
                contestId:    $contestId,
                title:        trim($data['title']        ?? $existing->title),
                description:  trim($data['description']  ?? '') ?: $existing->description,
                resources:    trim($data['resources']    ?? '') ?: $existing->resources,
                constraints:  trim($data['constraints']  ?? '') ?: $existing->constraints,
                criteriaJson: $data['criteria_json']     ?? $existing->criteriaJson,
                releasedAt:   $existing->releasedAt,
                createdAt:    $existing->createdAt,
                fileUrl:      $existing->fileUrl,   // giữ nguyên file_url cũ khi upsert text
                fileName:     $existing->fileName,
            );
            $this->challengeRepository->update($updated);
            return ['id' => $existing->id, 'action' => 'updated'];
        }

        // Tạo mới
        $newChallenge = new Challenge(
            id:           null,
            contestId:    $contestId,
            title:        trim($data['title'] ?? ''),
            description:  trim($data['description']  ?? '') ?: null,
            resources:    trim($data['resources']    ?? '') ?: null,
            constraints:  trim($data['constraints']  ?? '') ?: null,
            criteriaJson: $data['criteria_json']     ?? null,
        );

        if (empty($newChallenge->title)) {
            throw new Exception("Tiêu đề đề bài không được để trống!");
        }

        $id = $this->challengeRepository->save($newChallenge);
        return ['id' => $id, 'action' => 'created'];
    }

    // ── USE CASE 1b: Admin cập nhật file đề bài ──────────────────────────────

    public function updateFileInfo(int $contestId, string $fileUrl, string $fileName): void
    {
        $existing = $this->challengeRepository->findByContestId($contestId);
        if (!$existing) {
            // Tạo một bản nháp đề bài nếu chưa có
            $draftChallenge = new Challenge(
                id:           null,
                contestId:    $contestId,
                title:        'Bản nháp đề bài',
                description:  null,
                resources:    null,
                constraints:  null,
                criteriaJson: null,
                releasedAt:   null,
                createdAt:    null,
                fileUrl:      $fileUrl,
                fileName:     $fileName,
            );
            $this->challengeRepository->save($draftChallenge);
            return;
        }

        $updated = new Challenge(
            id:           $existing->id,
            contestId:    $existing->contestId,
            title:        $existing->title,
            description:  $existing->description,
            resources:    $existing->resources,
            constraints:  $existing->constraints,
            criteriaJson: $existing->criteriaJson,
            releasedAt:   $existing->releasedAt,
            createdAt:    $existing->createdAt,
            fileUrl:      $fileUrl,
            fileName:     $fileName,
        );
        $this->challengeRepository->update($updated);
    }

    // ── USE CASE 2: Admin phát đề thủ công ───────────────────────────────────

    public function release(int $contestId): void
    {
        $challenge = $this->challengeRepository->findByContestId($contestId);
        if (!$challenge) {
            throw new Exception("Chưa có đề bài nào cho cuộc thi này!");
        }
        if ($challenge->isReleased()) {
            throw new Exception("Đề bài đã được phát trước đó rồi!");
        }

        $released = $challenge->release();
        $this->challengeRepository->update($released);
    }

    // ── USE CASE 3: Thí sinh lấy đề bài ─────────────────────────────────────
    // Logic: Đề được hiển thị nếu đã released_at hoặc contest start_date đã qua

    public function getForParticipant(int $contestId): array
    {
        $contest = $this->getContestRow($contestId);
        if (!$contest) {
            throw new Exception("Cuộc thi không tồn tại!");
        }

        $challenge = $this->challengeRepository->findByContestId($contestId);
        $now       = new \DateTimeImmutable();
        $startDate = new \DateTimeImmutable($contest['start_date']);

        $isTimeReached      = $now >= $startDate;
        $isManuallyReleased = $challenge && $challenge->isReleased();

        if (!$challenge) {
            return [
                'available'  => false,
                'start_date' => $contest['start_date'],
                'message'    => 'Ban tổ chức chưa tải lên đề bài.',
            ];
        }

        if (!$isTimeReached && !$isManuallyReleased) {
            // Chưa đến giờ → trả meta để frontend đếm ngược
            return [
                'available'  => false,
                'start_date' => $contest['start_date'],
                'message'    => 'Đề bài sẽ được công bố khi cuộc thi bắt đầu.',
            ];
        }

        // Đã đến giờ hoặc đã phát thủ công → trả đầy đủ đề bài
        $criteria = $challenge->criteriaJson
            ? json_decode($challenge->criteriaJson, true)
            : [];

        return [
            'available'    => true,
            'id'           => $challenge->id,
            'title'        => $challenge->title,
            'description'  => $challenge->description,
            'resources'    => $challenge->resources,
            'constraints'  => $challenge->constraints,
            'criteria'     => $criteria,
            'released_at'  => $challenge->releasedAt?->format('c'),
            'start_date'   => $contest['start_date'],
            'file_url'     => $challenge->fileUrl,
            'file_name'    => $challenge->fileName,
        ];
    }

    // ── USE CASE 4: Admin xem toàn bộ đề bài (không filter thời gian) ────────

    public function getForAdmin(int $contestId): array
    {
        $contest = $this->getContestRow($contestId);
        if (!$contest) {
            throw new Exception("Cuộc thi không tồn tại!");
        }

        $challenge = $this->challengeRepository->findByContestId($contestId);
        if (!$challenge) {
            return [
                'exists'     => false,
                'start_date' => $contest['start_date'],
            ];
        }

        $criteria = $challenge->criteriaJson
            ? json_decode($challenge->criteriaJson, true)
            : [];

        return [
            'exists'        => true,
            'id'            => $challenge->id,
            'contest_id'    => $challenge->contestId,
            'title'         => $challenge->title,
            'description'   => $challenge->description,
            'resources'     => $challenge->resources,
            'constraints'   => $challenge->constraints,
            'criteria'      => $criteria,
            'criteria_json' => $challenge->criteriaJson,
            'released_at'   => $challenge->releasedAt?->format('c'),
            'created_at'    => $challenge->createdAt?->format('c'),
            'start_date'    => $contest['start_date'],
            'file_url'      => $challenge->fileUrl,
            'file_name'     => $challenge->fileName,
        ];
    }

    // ── HELPER ────────────────────────────────────────────────────────────────

    private function assertContestExists(int $contestId): void
    {
        if (!$this->getContestRow($contestId)) {
            throw new Exception("Cuộc thi không tồn tại!");
        }
    }

    private function getContestRow(int $contestId): ?array
    {
        $conn = $this->em->getConnection();
        $row  = $conn->executeQuery(
            "SELECT id, name, start_date, status FROM contests WHERE id = :id",
            ['id' => $contestId]
        )->fetchAssociative();

        return $row ?: null;
    }
}

