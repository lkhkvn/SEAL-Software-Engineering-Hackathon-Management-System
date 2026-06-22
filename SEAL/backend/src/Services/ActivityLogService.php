<?php

namespace App\Services;

use Doctrine\ORM\EntityManagerInterface;

class ActivityLogService {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    /**
     * Ghi nhận một hoạt động của Admin
     */
    public function logActivity(
        int $adminId,
        string $action,
        string $targetType,
        ?int $targetId,
        string $description,
        ?string $ipAddress = null
    ): void {
        try {
            $conn = $this->em->getConnection();
            $conn->executeStatement(
                "INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, description, ip_address, created_at) 
                 VALUES (:adminId, :action, :targetType, :targetId, :description, :ipAddress, NOW())",
                [
                    'adminId'     => $adminId,
                    'action'      => $action,
                    'targetType'  => $targetType,
                    'targetId'    => $targetId,
                    'description' => $description,
                    'ipAddress'   => $ipAddress
                ]
            );
        } catch (\Exception $e) {
            error_log("Lỗi ghi log hoạt động Admin: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách lịch sử hoạt động Admin
     */
    public function getAllLogs(): array {
        $conn = $this->em->getConnection();
        $sql = "
            SELECT 
                l.id,
                l.admin_id as adminId,
                u.name as adminName,
                u.email as adminEmail,
                u.role as adminRole,
                l.action,
                l.target_type as targetType,
                l.target_id as targetId,
                l.description,
                l.ip_address as ipAddress,
                l.created_at as createdAt
            FROM admin_activity_logs l
            INNER JOIN users u ON u.id = l.admin_id
            ORDER BY l.created_at DESC
        ";
        
        return $conn->executeQuery($sql)->fetchAllAssociative();
    }
}
