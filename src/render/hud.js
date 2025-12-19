import { formatTime } from '../../dev-kit/src/string.js';

export function drawHud(ctx, canvas, car) {
	ctx.textBaseline = 'middle';
	if (car.finished) {
		//black transparent background
		ctx.fillStyle = '#000';
		ctx.globalAlpha = 0.3;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;

		//Finished text
		ctx.fillStyle = '#fff';
		ctx.font = '14px monospace';
		ctx.fillText(
			`FINISH`,
			canvas.width / 2 - 24,
			canvas.height / 2 - 10
		);

		ctx.font = '10px monospace';
		ctx.fillText(
			`Time: ${formatTime(car.finishTime)}`,
			canvas.width / 2 - 50,
			canvas.height / 2 + 10
		);
		ctx.fillText(
			`Best: ${formatTime(Math.min(...car.lapTimes))}`,
			canvas.width / 2 - 50,
			canvas.height / 2 + 20
		);

		return;
	}

	ctx.fillStyle = '#fff';
	ctx.font = '10px monospace';

	//Lap counter
	ctx.fillText(`Lap: ${car.lap}/${car.maxLaps}`, 8, 12);
	//Current lap time
	ctx.fillText(`Time: ${formatTime(car.currentLapTime)}`, 8, 24);

	//1+ lap complete?
	if (car.lapTimes.length > 0) {
		//Last lap time
		ctx.fillText(`Last: ${formatTime(car.lapTimes.at(-1))}`, 8, 36);

		//Best lap time
		const best = Math.min(...car.lapTimes);
		ctx.fillText(`Best: ${formatTime(best)}`, 8, 48);

		//Delta lap time - last to best
		const delta = car.lapTimes.at(-1) - best;
		ctx.fillStyle = delta > 0 ? '#f23' : '#3f3';
		ctx.fillText(
			`Delta: ${delta > 0 ? '+' : '-'}${formatTime(delta)}`,
			8,
			60
		);
	}

	//Countdown?
	if (car.countdownActive) {
		ctx.fillStyle = '#fff';
		ctx.font = '32px monospace';
		ctx.textAlign = 'center';
		ctx.fillText(
			Math.ceil(car.countdown),
			canvas.width / 2,
			canvas.height / 2
		);
		ctx.textAlign = 'left';
	} else if (!car.raceStarted) {
		ctx.fillStyle = '#fff';
		ctx.font = '32px monospace';
		ctx.textAlign = 'center';
		ctx.fillText('GO!', canvas.width / 2, canvas.height / 2);
		ctx.textAlign = 'left';
	}
}
