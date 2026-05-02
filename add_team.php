<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require 'db.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['teamId']) || !isset($data['name'])) {
        echo json_encode(["status" => "error", "message" => "Missing teamId or name"]);
        exit;
    }

    $collection = $db->teams;
    
    // 1. Check if teamId already exists
    $existingId = $collection->findOne(['teamId' => $data['teamId']]);
    if ($existingId) {
        echo json_encode(["status" => "error", "message" => "Team ID already registered"]);
        exit;
    }

    // 2. Check if Name already exists (Safety: Prevent duplicate names)
    $existingName = $collection->findOne(['name' => $data['name']]);
    if ($existingName) {
        echo json_encode(["status" => "error", "message" => "Team Name already registered"]);
        exit;
    }
    
    $newTeam = [
        "teamId" => $data['teamId'],
        "name" => $data['name'],
        "initialPoints" => 40,
        "hotSeatPoints" => 0,
        "bonusPoints" => 0,
        "totalPoints" => 40,
        "isCorrect" => 0,
        "lifelines" => [
            "fiftyFifty" => true,
            "audiencePoll" => true,
            "phoneAFriend" => true,
            "doubleDip" => true
        ],
        "createdAt" => date("Y-m-d H:i:s")
    ];

    $collection->insertOne($newTeam);
    error_log("New Team Registered: " . $data['name'] . " (" . $data['teamId'] . ")");
    echo json_encode([
        "status" => "success", 
        "message" => "Team registered successfully",
        "data" => $newTeam
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Registration failed: " . $e->getMessage()]);
}
?>
