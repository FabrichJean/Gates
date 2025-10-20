
import React, { useEffect, useRef, useState } from 'react';

/**
 * LineBarLoader - a top-of-page progress bar like Facebook's loader.
 * - Listens to window events 'linebar:start' and 'linebar:finish'
 * - Exported start() and finish() functions for programmatic control
 */

let globalTimer: number | null = null;

export function startLineBar() {
	const ev = new Event('linebar:start');
	window.dispatchEvent(ev);
}

export function finishLineBar() {
	const ev = new Event('linebar:finish');
	window.dispatchEvent(ev);
}

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const LineBarLoader: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const progressRef = useRef(progress);

	useEffect(() => {
		progressRef.current = progress;
	}, [progress]);

	useEffect(() => {
		function start() {
			setLoading(true);
			setProgress(0);

			if (globalTimer) {
				window.clearInterval(globalTimer);
				globalTimer = null;
			}

			globalTimer = window.setInterval(() => {
				// increase randomly but not reach 100%
				setProgress((p) => {
					const next = clamp(p + Math.random() * 10, 0, 90);
					return next;
				});
			}, 200);
		}

		function finish() {
			setProgress(100);
			// short delay so the 100% is visible, then hide
			setTimeout(() => {
				setLoading(false);
				setProgress(0);
				if (globalTimer) {
					window.clearInterval(globalTimer);
					globalTimer = null;
				}
			}, 400);
		}

		window.addEventListener('linebar:start', start);
		window.addEventListener('linebar:finish', finish);

		return () => {
			window.removeEventListener('linebar:start', start);
			window.removeEventListener('linebar:finish', finish);
			if (globalTimer) {
				window.clearInterval(globalTimer);
				globalTimer = null;
			}
		};
	}, []);

	if (!loading) return null;

	return (
		<div className="absolute top-0 left-0 w-full h-1 z-[100]">
			<div
				className="h-full bg-green-400 transition-all duration-600"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
};

export default LineBarLoader;
