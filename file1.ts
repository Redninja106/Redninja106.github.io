﻿var fast = false;

var progress: number = 0;
var btn: HTMLButtonElement;

window.onload = function () {
    btn = document.getElementById('button') as HTMLButtonElement;
    btn.onclick = onbuttonclick;
}

function onbuttonclick(ev: MouseEvent) {
    fast = ev.altKey;
    requestAnimationFrame(onframe);
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
    document.getElementById('result').textContent = 'Your score is: ' + (fast ? '97% \n You have a blazing fast PC!' : '12% \n You idiot, you spent money on a potato.')
}