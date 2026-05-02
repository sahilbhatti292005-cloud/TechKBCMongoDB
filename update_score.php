<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require 'db.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    // Basic Validation
    if (!isset($data['teamId']) || !isset($data['points']) || !isset($data['type'])) {
        echo json_encode(["status" => "error", "message" => "Invalid request. Missing teamId, points, or type."]);
        exit;
    }

    $teamId = $data['teamId'];
    $points = (int)$data['points']; // The amount to add/subtract
    $type = $data['type']; // initialPoints, hotSeatPoints, or bonusPoints

    $collection = $db->teams;

    // 1. Team Existence Check (Safety: Ensure teamId is valid before updating)
    $team = $collection->findOne(['teamId' => $teamId]);
    if (!$team) {
        echo json_encode(["status" => "error", "message" => "Team not found"]);
        exit;
    }

    // 2. Increment the specific point type (Safe Add)
    $updateResult = $collection->updateOne(
        ['teamId' => $teamId],
        ['$inc' => [$type => $points]]
    );

    // 3. Fetch the team again to recalculate totalPoints (Safety Sync)
    $team = $collection->findOne(['teamId' => $teamId]);
    $totalPoints = ($team['initialPoints'] ?? 0) + ($team['hotSeatPoints'] ?? 0) + ($team['bonusPoints'] ?? 0);

    // 4. Update the totalPoints field
    $collection->updateOne(
        ['teamId' => $teamId],
        ['$set' => ['totalPoints' => $totalPoints]]
    );

    error_log("Score Updated: Team " . $teamId . " | Type: " . $type . " | New Total: " . $totalPoints);

    echo json_encode([
        "status" => "success",
        "data" => [
            "teamId" => $teamId,
            "updatedField" => $type,
            "totalPoints" => $totalPoints
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Failed to update score: " . $e->getMessage()]);
}
?>
