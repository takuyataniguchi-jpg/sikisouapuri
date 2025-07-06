document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const colorGrid = document.getElementById('color-grid');
    const hueSlider = document.getElementById('hue-slider');
    const hueValue = document.getElementById('hue-value');
    const mainPreview = document.getElementById('main-preview');
    const mainHexLabel = document.getElementById('main-hex-label');
    const harmonyOriginal = document.getElementById('harmony-original');
    const harmonyOriginalHex = document.getElementById('harmony-original-hex');
    const harmonyComplement = document.getElementById('harmony-complement');
    const harmonyComplementHex = document.getElementById('harmony-complement-hex');
    const harmonyAnalogous = document.getElementById('harmony-analogous');
    const harmonyAnalogousHex = document.getElementById('harmony-analogous-hex');
    const harmonyAnalogousNeg = document.getElementById('harmony-analogous-neg');
    const harmonyAnalogousNegHex = document.getElementById('harmony-analogous-neg-hex');
    const harmonyTriadic = document.getElementById('harmony-triadic');
    const harmonyTriadicHex = document.getElementById('harmony-triadic-hex');

    const downloadCsvBtn = document.getElementById('download-csv');
    const downloadJsonBtn = document.getElementById('download-json');

    // --- 状態管理 ---
    let selectedColor = chroma('#E91E63'); // 初期色
    let baseColor = selectedColor; // スライダーの基準となる色

    // ダウンロード用の現在の色情報を保持する変数
    let currentSelectedHex = '';
    let currentComplementHex = '';
    let currentAnalogousPosHex = '';
    let currentAnalogousNegHex = '';
    let currentTriadicHex = '';

    // --- プリセットカラー (30色) ---
    const presetColors = [
        '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
        '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
        '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E',
        '#607D8B', '#000000', '#FFFFFF', '#C62828', '#AD1457', '#6A1B9A',
        '#4527A0', '#283593', '#1565C0', '#0277BD', '#006064', '#2E7D32'
    ];

    // --- 関数 ---

    /**
     * UI全体を更新する
     * @param {chroma.Color} color - 表示する基準の色
     */
    function updateUI(color) {
        selectedColor = color;

        // メインプレビューの更新
        currentSelectedHex = color.hex();
        mainPreview.style.backgroundColor = currentSelectedHex;
        mainHexLabel.textContent = currentSelectedHex;

        // カラーハーモニーの計算と表示
        const complement = color.set('hsl.h', '+180');
        const analogousPos = color.set('hsl.h', '+30');
        const analogousNeg = color.set('hsl.h', '-30');
        const triadic = color.set('hsl.h', '+120');

        // 選択色
        currentSelectedHex = color.hex();
        harmonyOriginal.style.backgroundColor = currentSelectedHex;
        harmonyOriginalHex.textContent = currentSelectedHex;

        // 補色
        currentComplementHex = complement.hex();
        harmonyComplement.style.backgroundColor = currentComplementHex;
        harmonyComplementHex.textContent = currentComplementHex;

        // アナログ (+30°)
        currentAnalogousPosHex = analogousPos.hex();
        harmonyAnalogous.style.backgroundColor = currentAnalogousPosHex;
        harmonyAnalogousHex.textContent = currentAnalogousPosHex;

        // アナログ (-30°)
        currentAnalogousNegHex = analogousNeg.hex();
        harmonyAnalogousNeg.style.backgroundColor = currentAnalogousNegHex;
        harmonyAnalogousNegHex.textContent = currentAnalogousNegHex;

        // トライアド
        currentTriadicHex = triadic.hex();
        harmonyTriadic.style.backgroundColor = currentTriadicHex;
        harmonyTriadicHex.textContent = currentTriadicHex;
    }

    /**
     * プリセットカラーグリッドを生成する
     */
    function createColorGrid() {
        colorGrid.innerHTML = ''; // グリッドをクリア
        presetColors.forEach(hex => {
            const colorSample = document.createElement('div');
            colorSample.classList.add('color-sample');
            // プリセットカラーはシミュレーションの影響を受けない
            colorSample.style.backgroundColor = hex;
            colorSample.dataset.color = hex;
            colorGrid.appendChild(colorSample);
        });
    }

    /**
     * データをダウンロードするヘルパー関数
     * @param {string} filename - ファイル名
     * @param {string} data - ダウンロードするデータ
     * @param {string} type - MIMEタイプ
     */
    function downloadFile(filename, data, type) {
        const blob = new Blob([data], { type: type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // --- イベントリスナー ---

    // プリセットカラーのクリック
    colorGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-sample')) {
            const newColorHex = e.target.dataset.color;
            baseColor = chroma(newColorHex);

            // スライダーをリセットしてUIを更新
            hueSlider.value = 0;
            hueValue.textContent = '0°';
            updateUI(baseColor);
        }
    });

    // Hueスライダーの操作
    hueSlider.addEventListener('input', () => {
        const hueRotation = parseInt(hueSlider.value, 10);
        hueValue.textContent = `${hueRotation}°`;

        // baseColorを基準に色相を回転
        const originalHue = baseColor.get('hsl.h');
        const newHue = (originalHue + hueRotation) % 360;
        const rotatedColor = baseColor.set('hsl.h', newHue);

        updateUI(rotatedColor);
    });

    // CSVダウンロードボタンのクリック
    downloadCsvBtn.addEventListener('click', () => {
        const headers = 'selected,analog-30,analog+30,triad+120,反対色+180';
        const values = `${currentSelectedHex},${currentAnalogousNegHex},${currentAnalogousPosHex},${currentTriadicHex},${currentComplementHex}`;
        const csvContent = `${headers}\n${values}`;
        downloadFile('color_harmony.csv', csvContent, 'text/csv');
    });

    // JSONダウンロードボタンのクリック
    downloadJsonBtn.addEventListener('click', () => {
        const jsonData = {
            selected: currentSelectedHex,
            matches: [currentAnalogousNegHex, currentAnalogousPosHex, currentTriadicHex, currentComplementHex]
        };
        const jsonString = JSON.stringify(jsonData, null, 2); // 2スペースで整形
        downloadFile('color_harmony.json', jsonString, 'application/json');
    });


    // --- 初期化 ---
    createColorGrid();
    updateUI(selectedColor);
});
