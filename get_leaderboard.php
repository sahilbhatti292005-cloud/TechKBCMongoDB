<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require 'db.php';

try {
    $collection = $db->teams;

    // Sort by totalPoints descending
    $options = [
        'sort' => ['totalPoints' => -1]
    ];

    $cursor = $collection->find([], $options);
    $leaderboard = $cursor->toArray();

    if (empty($leaderboard)) {
        echo json_encode([
            "status" => "empty",
            "message" => "No teams joined yet",
            "data" => []
        ]);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "data" => $leaderboard
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Failed to load leaderboard: " . $e->getMessage()]);
}
?>
