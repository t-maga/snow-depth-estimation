let video = document.getElementById("videoInput");
let canvas = document.getElementById("canvasOutput");
let context = canvas.getContext("2d");

function onOpenCvReady() {
    if (typeof cv !== 'undefined' && cv.getBuildInformation) {
        console.log("OpenCV is ready");
        startCamera();
    } else {
        console.error("Failed to load OpenCV.js");
        alert("OpenCV.jsの読み込みに失敗しました。");
    }
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
        .then(function (stream) {
            video.srcObject = stream;
            console.log("Camera stream started");
        })
        .catch(function (err) {
            console.error("Error accessing camera: " + err);
            alert("カメラへのアクセスに失敗しました: " + err.message);
        });

    video.addEventListener('play', function() {
        console.log("Video is playing");
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
        if (video.paused || video.ended) {
            return;
        }

        cap.read(src);
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // Arucoマーカーの検出
        let dictionary = new cv.aruco.Dictionary_get(cv.aruco.DICT_4X4_50);
        let parameters = new cv.aruco.DetectorParameters();
        parameters.minDistanceToBorder = 3;
        parameters.adaptiveThreshWinSizeMin = 3;
        parameters.adaptiveThreshWinSizeMax = 23;
        parameters.adaptiveThreshWinSizeStep = 10;
        parameters.minMarkerPerimeterRate = 0.03;
        parameters.maxMarkerPerimeterRate = 4.0;
        parameters.polygonalApproxAccuracyRate = 0.05;
        parameters.minCornerDistanceRate = 0.05;
        parameters.minMarkerDistanceRate = 0.05;
        parameters.minOtsuStdDev = 5.0;
        let corners = new cv.MatVector();
        let ids = new cv.Mat();

        cv.aruco.detectMarkers(gray, dictionary, corners, ids, parameters);

        // 検出されたマーカーの表示
        if (ids.rows > 0) {
            // マーカーに緑色の外枠を表示
            cv.aruco.drawDetectedMarkers(src, corners, ids, new cv.Scalar(0, 255, 0));
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
