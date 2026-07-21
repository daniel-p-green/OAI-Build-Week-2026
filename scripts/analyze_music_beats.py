#!/usr/bin/env python3
"""Estimate tempo, beat grid, and high-energy cut points from an f32 mono file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np


def moving_average(values: np.ndarray, width: int) -> np.ndarray:
    if width <= 1:
        return values
    kernel = np.ones(width, dtype=np.float64) / width
    return np.convolve(values, kernel, mode="same")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("audio", type=Path, help="mono float32 little-endian PCM")
    parser.add_argument("--sample-rate", type=int, default=22050)
    parser.add_argument("--min-bpm", type=float, default=65.0)
    parser.add_argument("--max-bpm", type=float, default=180.0)
    args = parser.parse_args()

    samples = np.fromfile(args.audio, dtype="<f4").astype(np.float64)
    frame = 1024
    hop = 256
    usable = 1 + max(0, (len(samples) - frame) // hop)
    frames = np.lib.stride_tricks.sliding_window_view(samples, frame)[::hop][:usable]
    window = np.hanning(frame)
    magnitude = np.abs(np.fft.rfft(frames * window, axis=1))
    flux = np.maximum(0.0, np.diff(magnitude, axis=0)).sum(axis=1)
    flux = moving_average(flux, 3)
    baseline = moving_average(flux, max(3, round(args.sample_rate / hop * 0.45)))
    onset = np.maximum(0.0, flux - baseline)
    onset /= np.percentile(onset, 99.5) or 1.0

    fps = args.sample_rate / hop
    min_lag = round(fps * 60 / args.max_bpm)
    max_lag = round(fps * 60 / args.min_bpm)
    correlations = []
    for lag in range(min_lag, max_lag + 1):
        score = float(np.dot(onset[:-lag], onset[lag:]))
        bpm = 60 * fps / lag
        # Prefer the musically useful 80-150 BPM interpretation over half/double aliases.
        preference = 1.0 if 80 <= bpm <= 150 else 0.92
        correlations.append((score * preference, lag, bpm))
    _, best_lag, bpm = max(correlations)

    phase_scores = []
    for phase in range(best_lag):
        indices = np.arange(phase, len(onset), best_lag)
        phase_scores.append((float(onset[indices].sum()), phase))
    _, phase = max(phase_scores)
    beat_frames = np.arange(phase, len(onset), best_lag)
    beat_seconds = (beat_frames + 1) * hop / args.sample_rate

    local = moving_average(onset, max(1, round(fps * 0.08)))
    peaks = np.where((local[1:-1] > local[:-2]) & (local[1:-1] >= local[2:]))[0] + 1
    threshold = np.percentile(local[peaks], 82) if len(peaks) else 0
    strong = peaks[local[peaks] >= threshold]
    strong_seconds = (strong + 1) * hop / args.sample_rate

    energy_frame = round(args.sample_rate * 0.5)
    energy_hop = energy_frame
    energy_count = len(samples) // energy_frame
    energy = np.sqrt(np.mean(samples[: energy_count * energy_frame].reshape(energy_count, energy_frame) ** 2, axis=1))
    energy /= np.max(energy) or 1.0

    result = {
        "durationSeconds": round(len(samples) / args.sample_rate, 6),
        "estimatedBpm": round(float(bpm), 3),
        "beatIntervalSeconds": round(float(best_lag / fps), 6),
        "firstBeatSeconds": round(float(beat_seconds[0]), 6),
        "beatsSeconds": [round(float(value), 3) for value in beat_seconds],
        "strongOnsetsSeconds": [round(float(value), 3) for value in strong_seconds],
        "halfSecondEnergy": [round(float(value), 5) for value in energy],
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
