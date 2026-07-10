<?php
namespace App\Services;

use App\Infrastructure\Model\ScheduleModel;
use Doctrine\ORM\EntityManagerInterface;
use Exception;

class ScheduleService {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    public function getAll(?int $hackathonId = null): array {
        $repo = $this->em->getRepository(ScheduleModel::class);
        $criteria = [];
        if ($hackathonId !== null) {
            $criteria['hackathonId'] = $hackathonId;
        }
        $schedules = $repo->findBy($criteria);

        return array_map(function(ScheduleModel $s) {
            return [
                "id"          => $s->id,
                "hackathonId" => $s->hackathonId,
                "title"       => $s->title,
                "description" => $s->description,
                "startTime"   => $s->startTime ? $s->startTime->format('c') : null,
                "endTime"     => $s->endTime   ? $s->endTime->format('c')   : null,
                "location"    => $s->location
            ];
        }, $schedules);
    }

    public function create(array $data): int {
        $schedule = new ScheduleModel();
        $schedule->title       = $data['title']       ?? 'Untitled Event';
        $schedule->description = $data['description'] ?? null;
        $schedule->location    = $data['location']    ?? null;

        if (!empty($data['hackathonId'])) {
            $schedule->hackathonId = (int)$data['hackathonId'];
        }
        $schedule->startTime = !empty($data['startTime'])
            ? new \DateTime($data['startTime'])
            : new \DateTime();
        if (!empty($data['endTime'])) {
            $schedule->endTime = new \DateTime($data['endTime']);
            if ($schedule->endTime < $schedule->startTime) {
                throw new Exception("Thời gian kết thúc không thể trước thời gian bắt đầu!");
            }
        }

        $this->em->persist($schedule);
        $this->em->flush();

        return $schedule->id;
    }

    public function update(int $id, array $data): void {
        $repo = $this->em->getRepository(ScheduleModel::class);
        $schedule = $repo->find($id);
        if (!$schedule) {
            throw new Exception("Lịch trình không tồn tại!");
        }

        $startTime = isset($data['startTime']) ? new \DateTime($data['startTime']) : $schedule->startTime;
        $endTime = $schedule->endTime;
        if (isset($data['endTime'])) {
            $endTime = !empty($data['endTime']) ? new \DateTime($data['endTime']) : null;
        }

        if ($endTime !== null && $endTime < $startTime) {
            throw new Exception("Thời gian kết thúc không thể trước thời gian bắt đầu!");
        }

        if (isset($data['title']))       $schedule->title       = $data['title'];
        if (isset($data['description'])) $schedule->description = $data['description'];
        if (isset($data['location']))    $schedule->location    = $data['location'];
        if (isset($data['startTime']))   $schedule->startTime   = $startTime;
        if (isset($data['endTime']))     $schedule->endTime     = $endTime;

        $this->em->flush();
    }

    public function delete(int $id): void {
        $repo = $this->em->getRepository(ScheduleModel::class);
        $schedule = $repo->find($id);
        if (!$schedule) {
            throw new Exception("Lịch trình không tồn tại!");
        }
        $this->em->remove($schedule);
        $this->em->flush();
    }
}
