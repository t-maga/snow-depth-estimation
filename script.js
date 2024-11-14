let video = document.getElementById("videoInput");
let canvas = document.getElementById("canvasOutput");
let context = canvas.getContext("2d");

function onOpenCvReady() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
        .then(function (stream) {
            video.srcObject = stream;
        })
        .catch(function (err) {
            console.error("Error accessing camera: " + err);
        });

    video.addEventListener('play', function() {
        processVideo();
    });
}

function processVideo() {
    let cap = new cv.VideoCapture(video);
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let gray = new cv.Mat();
    let markers = new cv.Mat();

    const FPS = 30;
    function processFrame() {
        cap.read(src);
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // Arucoマーカーの検出
        let dictionary = new cv.aruco_Dictionary(cv.DICT_4X4_50);
        let parameters = new cv.aruco_DetectorParameters();
        let detector = new cv.aruco_Detector(dictionary, parameters);
        let corners = new cv.MatVector();
        let ids = new cv.Mat();

        detector.detectMarkers(gray, corners, ids);

        // 検出されたマーカーの表示
        if (!ids.empty()) {
            cv.aruco.drawDetectedMarkers(src, corners, ids);
            // マーカーの位置からスケールを基に積雪量の推定を行う処理
            let snowDepth = calculateSnowDepth(ids, corners);
            document.getElementById("result").innerText = `現在の積雪量: ${snowDepth} cm`;
        } else {
            document.getElementById("result").innerText = "Arucoマーカーが見つかりませんでした。";
        }

        cv.imshow('canvasOutput', src);
        setTimeout(processFrame, 1000 / FPS);
    }
    processFrame();
}

function calculateSnowDepth(ids, corners) {
    // マーカーIDが0番であることを確認
    if (ids.data32S[0] === 0) {
        // コーナー情報から目盛りがどこまで隠れているかを計算する（簡易的な仮実装）
        // ここで積雪の高さを推測する処理を記述
        // 例えば、特定の高さで目盛りが隠れている部分を基に計算する
        return 15; // 仮の積雪量（cm）
    }
    return 0;
}
