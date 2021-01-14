var fast = false;
var progress = -1;
var btn;
window.onload = function () {
    btn = document.getElementById('button');
    btn.onclick = onbuttonclick;
    document.getElementById('result').hidden = true;
};
function onbuttonclick(ev) {
    btn.hidden = true;
    if (progress >= 100 || progress < 0) {
        fast = ev.altKey;
        progress = 0;
        requestAnimationFrame(onframe);
    }
}
function onframe() {
    progress += fast ? 1 : 0.1;
    document.getElementById('progress').textContent = 'Progress: ' + Math.floor(progress) + '%.';
    if (progress >= 100) {
        end();
        return;
    }
    requestAnimationFrame(onframe);
}
function end() {
    document.getElementById('result').hidden = false;
    document.getElementById('progress').textContent = '';
    document.getElementById('yourscoreis').textContent = 'Your score:';
    document.getElementById('score').textContent = (fast ? '96,102,837' : '12') + ' points.';
    document.getElementById('comment').textContent = (fast ? 'Wow! You have the best PC money can buy! There is nothing much else I can say. I have never seen a PC this fast in my life!' : 'You idiot, you spent money on a potato. Your pc can\'t even run doom when overclocked.');
}
//# sourceMappingURL=file1.js.map