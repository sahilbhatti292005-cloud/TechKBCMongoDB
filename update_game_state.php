<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require 'db.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['phase'])) {
        echo json_encode(["status" => "error", "message" => "Missing phase information"]);
        exit;
    }

    $collection = $db->game_state;
    
    // Safety: Ensure we only ever have ONE state document
    $collection->updateOne(
        ['state' => 'main'],
        ['$set' => [
            'phase' => $data['phase'],
            'currentQuestionId' => $data['currentQuestionId'] ?? null,
            'timer' => $data['timer'] ?? null, // duration, remaining, isRunning etc
            'updatedAt' => date("Y-m-d H:i:s")
        ]],
        ['upsert' => true]
    );
    
    error_log("Game State Updated: Phase " . $data['phase']);

    echo json_encode([
        "status" => "success",
        "message" => "Game state updated successfully"
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "State update failed: " . $e->getMessage()]);
}
?>
