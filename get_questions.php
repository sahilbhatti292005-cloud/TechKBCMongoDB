<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require 'db.php';

try {
    $difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : 'easy';
    $collection = $db->questions;

    // Fetch ONE question that hasn't been asked yet
    $question = $collection->findOne([
        'difficulty' => $difficulty,
        'asked' => [ '$ne' => true ] // Filter out already asked questions
    ]);

    if ($question) {
        // Mark as asked so it doesn't repeat
        $collection->updateOne(
            ['_id' => $question['_id']],
            ['$set' => ['asked' => true]]
        );

        echo json_encode([
            "status" => "success",
            "data" => $question
        ]);
    } else {
        echo json_encode(["status" => "end", "message" => "No more questions for this difficulty"]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Failed to fetch question: " . $e->getMessage()]);
}
?>
