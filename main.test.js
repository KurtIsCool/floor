const { formatTime, formatDistance, calculateETA, getFilteredRides, createRideCard, fetchRidesData } = require('./main');

describe('Utility Functions', () => {
    describe('formatTime', () => {
        test('should format minutes correctly', () => {
            expect(formatTime(45)).toBe('45 min');
        });

        test('should format hours and minutes correctly', () => {
            expect(formatTime(75)).toBe('1h 15m');
        });

        test('should handle exactly 60 minutes', () => {
            expect(formatTime(60)).toBe('1h 0m');
        });

        test('should handle 0 minutes', () => {
            expect(formatTime(0)).toBe('0 min');
        });
    });

    describe('formatDistance', () => {
        test('should format kilometers correctly', () => {
            expect(formatDistance(5.5)).toBe('5.5 km');
        });

        test('should format meters correctly for distances less than 1 km', () => {
            expect(formatDistance(0.75)).toBe('750m');
        });

        test('should handle exactly 1 km', () => {
            expect(formatDistance(1)).toBe('1.0 km');
        });

        test('should handle 0 km', () => {
            expect(formatDistance(0)).toBe('0m');
        });
    });

    describe('calculateETA', () => {
        test('should calculate ETA correctly with default speed', () => {
            expect(calculateETA(12.5)).toBe(30); // 12.5km / 25km/h = 0.5h = 30min
        });

        test('should calculate ETA correctly with custom speed', () => {
            expect(calculateETA(12.5, 50)).toBe(15); // 12.5km / 50km/h = 0.25h = 15min
        });

        test('should handle 0 distance', () => {
            expect(calculateETA(0)).toBe(0);
        });
    });
});

describe('API Interaction Functions', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    describe('fetchRidesData', () => {
        test('should return ride data on successful fetch', async () => {
            const mockRides = [{ id: 1, pickup: 'A', destination: 'B' }];
            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockRides),
            });

            const data = await fetchRidesData();
            expect(data).toEqual(mockRides);
            expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/rides");
        });

        test('should throw an error if the fetch response is not ok', async () => {
            fetch.mockResolvedValue({ ok: false });
            await expect(fetchRidesData()).rejects.toThrow('Failed to fetch rides');
        });

        test('should throw an error on network failure', async () => {
            fetch.mockRejectedValue(new Error('Network error'));
            await expect(fetchRidesData()).rejects.toThrow('Network error');
        });
    });
});


describe('Core Logic Functions', () => {
    describe('getFilteredRides', () => {
        const sampleRides = [
            { id: 1, distance: '2.5 km' },
            { id: 2, distance: '5.0 km' },
            { id: 3, distance: '1.0 km' },
            { id: 4, distance: '10.0 km' },
            { id: 5, distance: '2.9 km' },
        ];

        test('should return all rides when filter is "all"', () => {
            expect(getFilteredRides(sampleRides, 'all')).toEqual(sampleRides);
        });

        test('should return nearby rides (<= 3.0 km) when filter is "nearby"', () => {
            const expected = [
                { id: 1, distance: '2.5 km' },
                { id: 3, distance: '1.0 km' },
                { id: 5, distance: '2.9 km' },
            ];
            expect(getFilteredRides(sampleRides, 'nearby')).toEqual(expected);
        });

        test('should return the first 4 rides when filter is "recent"', () => {
            const expected = sampleRides.slice(0, 4);
            expect(getFilteredRides(sampleRides, 'recent')).toEqual(expected);
        });

        test('should return all rides by default if filter is unknown', () => {
            expect(getFilteredRides(sampleRides, 'unknown')).toEqual(sampleRides);
        });

        test('should handle an empty array of rides', () => {
            expect(getFilteredRides([], 'all')).toEqual([]);
            expect(getFilteredRides([], 'nearby')).toEqual([]);
            expect(getFilteredRides([], 'recent')).toEqual([]);
        });
    });
});