export function loadRecord(trackId) {
	const key = `time_${trackId}`;
	const raw = localStorage.getItem(key);
	return raw ? JSON.parse(raw) : null;
}

export function saveRecord(trackId, record) {
	const key = `time_${trackId}`;
	localStorage.setItem(key, JSON.stringify(record));
}

const CC_KEY = 'completedCC';

export function loadCompletedCC() {
	return JSON.parse(localStorage.getItem(CC_KEY) || '[]');
}

export function markCCComplete(cc) {
	const cleared = new Set(
		JSON.parse(localStorage.getItem(CC_KEY) || '[]')
	);
	cleared.add(cc);
	localStorage.setItem(CC_KEY, JSON.stringify([...cleared]));
}

export function isCCComplete(cc) {
	return loadCompletedCC().includes(cc);
}
export function isCCFullyCleared(cc, tracks) {
	return tracks.filter((t) => t.cc === cc).every((t) => loadRecord(t.id));
}

export function clearStorage() {
	localStorage.clear();
}
