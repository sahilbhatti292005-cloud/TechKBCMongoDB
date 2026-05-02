<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require 'db.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    // Validation
    if (!isset($data['teamId']) || !isset($data['questionId']) || !isset($data['answer'])) {
        echo json_encode(["status" => "error", "message" => "Invalid request data"]);
        exit;
    }

    // 1. Phase Check (Safety: Submissions only allowed during active game phases)
    $state = $db->game_state->findOne(['state' => 'main']);
    
    // Auto-initialize state if missing
    if (!$state) {
        $db->game_state->insertOne([
            "state" => "main",
            "phase" => "LOBBY",
            "updatedAt" => date("Y-m-d H:i:s")
        ]);
        echo json_encode(["status" => "blocked", "message" => "Game not started. Phase: LOBBY"]);
        exit;
    }

    if ($state['phase'] !== 'HOT_SEAT' && $state['phase'] !== 'FFF') {
        echo json_encode(["status" => "blocked", "message" => "Submissions closed. Phase: " . $state['phase']]);
        exit;
    }

    $collection = $db->submissions;
    
    // 2. Duplicate Check (Safety: Prevent double-tapping/multiple submissions)
    $existing = $collection->findOne([
        'teamId' => $data['teamId'],
        'questionId' => $data['questionId']
    ]);

    if ($existing) {
        echo json_encode(["status" => "error", "message" => "Already answered"]);
        exit;
    }

    // 3. Answer Normalization (A/B/C/D should be consistent)
    $cleanAnswer = strtoupper(trim($data['answer']));

    $submission = [
        "teamId" => $data['teamId'],
        "questionId" => $data['questionId'],
        "answer" => $cleanAnswer,
        "timeTaken" => (int)($data['timeTaken'] ?? 0),
        "isCorrect" => (bool)($data['isCorrect'] ?? false),
        "submittedAt" => date("Y-m-d H:i:s")
    ];

    $collection->insertOne($submission);
    error_log("Answer Submitted: Team " . $data['teamId'] . " for Question " . $data['questionId']);

    echo json_encode([
        "status" => "success",
        "message" => "Answer submitted successfully",
        "data" => $submission
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Submission failed: " . $e->getMessage()]);
}
?>
