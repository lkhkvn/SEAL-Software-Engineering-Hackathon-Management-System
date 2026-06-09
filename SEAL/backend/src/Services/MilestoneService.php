<?php
namespace App\Services;

use App\Infrastructure\Model\MilestoneModel;
use Doctrine\ORM\EntityManagerInterface;
use Exception;

class MilestoneService {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    public function getByHackathon(int $hackathonId): array {
        $repo = $this->em->getRepository(MilestoneModel::class);
        $milestones = $repo->findBy(['hackathonId' => $hackathonId]);

        return array_map(function(MilestoneModel $m) {
            return [
                "id"          => $m->id,
                "hackathonId" => $m->hackathonId,
                "name"        => $m->name,
                "description" => $m->description,
                "dueDate"     => $m->dueDate ? $m->dueDate->format('c') : null
            ];
        }, $milestones);
    }

    public function create(int $hackathonId, array $data): int {
        $milestone = new MilestoneModel();
        $milestone->hackathonId = $hackathonId;
        $milestone->name        = $data['name'] ?? 'Untitled Milestone';
        $milestone->description = $data['description'] ?? null;
        if (!empty($data['dueDate'])) {
            $milestone->dueDate = new \DateTime($data['dueDate']);
        }

        $this->em->persist($milestone);
        $this->em->flush();

        return $milestone->id;
    }

    public function update(int $id, array $data): void {
        $repo = $this->em->getRepository(MilestoneModel::class);
        $milestone = $repo->find($id);

        if (!$milestone) {
            throw new Exception("Mốc thời gian không tồn tại!");
        }

        if (isset($data['name']))        $milestone->name        = $data['name'];
        if (isset($data['description'])) $milestone->description = $data['description'];
        if (isset($data['dueDate'])) {
            $milestone->dueDate = !empty($data['dueDate']) ? new \DateTime($data['dueDate']) : null;
        }

        $this->em->flush();
    }

    public function delete(int $id): void {
        $repo = $this->em->getRepository(MilestoneModel::class);
        $milestone = $repo->find($id);

        if (!$milestone) {
            throw new Exception("Mốc thời gian không tồn tại!");
        }

        $this->em->remove($milestone);
        $this->em->flush();
    }
}
