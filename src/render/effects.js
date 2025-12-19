export function drawEffects(ctx, car) {
	for (let i = car.skidMarks.length - 1; i >= 0; i--) {
		const mark = car.skidMarks[i];
		ctx.fillStyle = `rgba(30,30,30,${mark.life})`;
		ctx.fillRect(mark.x - 2, mark.y - 2, 4, 4);
		mark.life -= 0.02; //Fade speed
		if (mark.life <= 0) car.skidMarks.splice(i, 1);
	}
}
