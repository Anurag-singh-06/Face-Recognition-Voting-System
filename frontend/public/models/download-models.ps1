$models = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1"
)

$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/"

foreach ($model in $models) {
    $url = $baseUrl + $model
    $output = Join-Path $PSScriptRoot $model
    Write-Host "Downloading $model..."
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host "Downloaded $model"
}
