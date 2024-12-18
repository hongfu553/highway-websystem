document.querySelectorAll('.ts-button').forEach(button => {
    button.addEventListener('click', () => {
        // 取得按鈕上的 data-direction 屬性值
        const direction = button.getAttribute('data-direction');
        // 將 data-direction 值顯示在 console
        console.log(direction);
    });
});

// 當送出按鈕被點擊時
document.getElementById('submitButton').addEventListener('click', () => {
    // 顯示提示訊息
    alert('已送出');
});