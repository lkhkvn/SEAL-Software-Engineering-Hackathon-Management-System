<?php

namespace App\Domain\Entity;

/**
 * Domain Entity: Challenge (Đề bài cuộc thi)
 * Tầng nghiệp vụ thuần tuý — không phụ thuộc bất kỳ framework hay ORM nào.
 */
class Challenge
{
    public function __construct(
        public readonly ?int    $id,
        public readonly int     $contestId,
        public readonly string  $title,
        public readonly ?string $description  = null,
        public readonly ?string $resources    = null,   // Tài liệu / API mẫu
        public readonly ?string $constraints  = null,   // Ràng buộc kỹ thuật
        public readonly ?string $criteriaJson = null,   // JSON tiêu chí chấm điểm
        public readonly ?\DateTimeInterface $releasedAt = null,
        public readonly ?\DateTimeInterface $createdAt  = null,
        public readonly ?string $fileUrl      = null,   // URL file đề bài
        public readonly ?string $fileName     = null,   // Tên gốc file
        public readonly ?\DateTimeInterface $submissionDeadline = null, // Hạn nộp bài
    ) {}

    /**
     * Kiểm tra đề bài đã được phát chính thức chưa.
     * Đề được coi là "phát" khi admin đã nhấn Release
     * HOẶC thời gian đã vượt quá start_date của contest (do ChallengeService kiểm tra).
     */
    public function isReleased(): bool
    {
        return $this->releasedAt !== null
            && $this->releasedAt <= new \DateTimeImmutable();
    }

    /**
     * Tạo bản sao immutable với releasedAt = bây giờ (Immutable pattern).
     */
    public function release(): self
    {
        return new self(
            id:           $this->id,
            contestId:    $this->contestId,
            title:        $this->title,
            description:  $this->description,
            resources:    $this->resources,
            constraints:  $this->constraints,
            criteriaJson: $this->criteriaJson,
            releasedAt:   new \DateTimeImmutable(),
            createdAt:    $this->createdAt,
            fileUrl:      $this->fileUrl,
            fileName:     $this->fileName,
            submissionDeadline: $this->submissionDeadline,
        );
    }
}
