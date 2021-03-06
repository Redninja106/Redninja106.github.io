﻿var fast = false;

var progress: number = -1;
var btn: HTMLButtonElement;

window.onload = function () {
    btn = document.getElementById('button') as HTMLButtonElement;
    btn.onclick = onbuttonclick;
    document.getElementById('result').hidden = true;
}

function onbuttonclick(ev: MouseEvent) {

    btn.hidden = true;

    if (progress >= 100 || progress < 0) {
        fast = ev.altKey;
        progress = 0;
        requestAnimationFrame(onframe);
    }
}

function onframe() {
    progress+= fast ? 1 : 0.1;

    document.getElementById('progress').textContent = 'Progress: ' + Math.floor(progress) + '%.';

    if (progress >= 100)
    {
        end();
        return;
    }

    requestAnimationFrame(onframe);
}

function end() {
    document.getElementById('result').hidden = false;
    document.getElementById('progress').textContent = '';
    document.getElementById('yourscoreis').textContent = 'Your score:';
    document.getElementById('score').textContent = (fast ? Math.floor(Math.random() * 10000000 + 90000000) : Math.floor(Math.random() * 20)) + ' points.'
    document.getElementById('comment').textContent = (fast ? 'Wow! You have the best PC money can buy! There is nothing much else I can say. I have never seen a PC this fast in my life!' : 'You idiot, you spent money on a potato. Your pc can\'t even run doom when overclocked.')
}