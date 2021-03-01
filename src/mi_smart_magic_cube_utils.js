const assert = (assertion_fulfilled, error_message='Assertion failed') => {
	if (! assertion_fulfilled) {
		throw (new Error(error_message));
	}
}

const converse_angle_set_single = (cube, angleFace, p1, p2, p3, c1, c2, c3, y_first) => {
	assert(((angleFace >= 1) && (angleFace <= 3)), 'Invalid angleFace');
	if (y_first && (angleFace <= 2)) {
		angleFace = ((angleFace === 1) ? 2 : 1);
	}
	[cube[p1], cube[p2], cube[p3]] = ((angleFace === 1) ? [c3, c1, c2] : ((angleFace === 2) ? [c2, c3, c1] : [c1, c2, c3]));
}

const ANGLE_TO_C123 = {
	1: [1, 2, 3],
	2: [1, 3, 4],
	3: [1, 4, 5],
	4: [1, 5, 2],
	5: [6, 3, 2],
	6: [6, 4, 3],
	7: [6, 5, 4],
	8: [6, 2, 5],
};

const converseAngleSet = (cube, angle, angleFace, f1, f2, f3, y_first) => {
	assert(((angle >= 1) && (angle <= 8)), 'Invalid angle');
	converse_angle_set_single(cube, angleFace, f1, f2, f3, ...ANGLE_TO_C123[angle], y_first)
}

const converse_line_set_single = (cube, lineFace, p1, p2, c1, c2) => {
	assert(((lineFace >= 1) && (lineFace <= 2)), 'Invalid lineFace');
	[cube[p1], cube[p2]] = ((lineFace === 1) ? [c1, c2] : [c2, c1]);
};

const LINE_TO_C12 = {
	 1: [1, 2],
	 2: [1, 3],
	 3: [1, 4],
	 4: [1, 5],
	 5: [2, 3],
	 6: [4, 3],
	 7: [4, 5],
	 8: [2, 5],
	 9: [6, 2],
	10: [6, 3],
	11: [6, 4],
	12: [6, 5],
};

const converse_line_set = function(cube, line, lineFace, p1, p2) {
	assert(((line >= 1) && (line <= 12)), 'Invalid line');
	converse_line_set_single(cube, lineFace, p1, p2, ...LINE_TO_C12[line]);
};

const converse_change_face_again = (cube, a1, a2, a3, a4) => {
	[cube[a1], cube[a2], cube[a3], cube[a4]] = [cube[a4], cube[a1], cube[a2], cube[a3]];
};

const extract_nibbles = (cubeOutputDataDebug, length, offset) =>
	Uint8Array.from({length:length}, ((v, i) => ((((i % 2) === 0) ? get_high_nibble_of : get_low_nibble_of)(cubeOutputDataDebug[offset + (i >> 1)]))))

const converse_to_paper_type = function(cubeOutputDataDebug) {
	assert(cubeOutputDataDebug.length >= 16);
	const array2 = extract_nibbles(cubeOutputDataDebug,  8, 0);
	const array3 = extract_nibbles(cubeOutputDataDebug,  8, 4);
	const array4 = extract_nibbles(cubeOutputDataDebug, 12, 8);
	let array5 = new Uint8Array(12);
	for (let index=0; index < 12; index++) {
		array5[index] = (((cubeOutputDataDebug[14 + Math.floor(index / 8)] & (1 << (7 - (index % 8)))) !== 0) ? 2 : 1);
	}
	let array = new Uint8Array(55);
	[array[32], array[41], array[50], array[14], array[23], array[5]] = [1, 2, 3, 4, 5, 6];
	converseAngleSet(array, array2[0], array3[0], 34, 43, 54, false);
	converseAngleSet(array, array2[1], array3[1], 36, 52, 18, true);
	converseAngleSet(array, array2[2], array3[2], 30, 16, 27, false);
	converseAngleSet(array, array2[3], array3[3], 28, 25, 45, true);
	converseAngleSet(array, array2[4], array3[4], 1, 48, 37, true);
	converseAngleSet(array, array2[5], array3[5], 3, 12, 46, false);
	converseAngleSet(array, array2[6], array3[6], 9, 21, 10, true);
	converseAngleSet(array, array2[7], array3[7], 7, 39, 19, false);
	converse_line_set(array, array4[0], array5[0], 31, 44);
	converse_line_set(array, array4[1], array5[1], 35, 53);
	converse_line_set(array, array4[2], array5[2], 33, 17);
	converse_line_set(array, array4[3], array5[3], 29, 26);
	converse_line_set(array, array4[4], array5[4], 40, 51);
	converse_line_set(array, array4[5], array5[5], 15, 49);
	converse_line_set(array, array4[6], array5[6], 13, 24);
	converse_line_set(array, array4[7], array5[7], 42, 22);
	converse_line_set(array, array4[8], array5[8], 4, 38);
	converse_line_set(array, array4[9], array5[9], 2, 47);
	converse_line_set(array, array4[10], array5[10], 6, 11);
	converse_line_set(array, array4[11], array5[11], 8, 20);
	converse_change_face_again(array, 1, 7, 9, 3);
	converse_change_face_again(array, 4, 8, 6, 2);
	converse_change_face_again(array, 37, 19, 10, 46);
	converse_change_face_again(array, 38, 20, 11, 47);
	converse_change_face_again(array, 39, 21, 12, 48);
	converse_change_face_again(array, 40, 22, 13, 49);
	converse_change_face_again(array, 41, 23, 14, 50);
	converse_change_face_again(array, 42, 24, 15, 51);
	converse_change_face_again(array, 43, 25, 16, 52);
	converse_change_face_again(array, 44, 26, 17, 53);
	converse_change_face_again(array, 45, 27, 18, 54);
	converse_change_face_again(array, 34, 28, 30, 36);
	converse_change_face_again(array, 31, 29, 33, 35);
	return array;
};

const convert_decoded_bytes_to_wachino_facelets = (decoded_bytes) =>
	Array.from(converse_to_paper_type(decoded_bytes)).slice(1)

const get_high_nibble_of = (uint8_value) =>
	(uint8_value >> 4)

const get_low_nibble_of = (uint8_value) =>
	(uint8_value & 15)

const DECODE_ARRAY = (new Uint8Array([
	0x50, 0xAF, 0x98, 0x20, 0xAA, 0x77, 0x13, 0x89, 0xDA,
	0xE6, 0x3F, 0x5F, 0x2E, 0x82, 0x6A, 0xAF, 0xA3, 0xF3,
	0x14, 0x07, 0xA7, 0x15, 0xA8, 0xE8, 0x8F, 0xAF, 0x2A,
	0x7D, 0x7E, 0x39, 0xFE, 0x57, 0xD9, 0x5B, 0x55, 0xD7,
]));

const decode_encoded_bytes = (encoded_bytes) => {
	assert(((encoded_bytes.length === 20) && (encoded_bytes[18] === 167)), 'Invalid encoded bytes array');
	return encoded_bytes.slice(0, 18).map((data_byte, byte_index) => (data_byte - DECODE_ARRAY[byte_index + get_low_nibble_of(encoded_bytes[19])] - DECODE_ARRAY[byte_index + get_high_nibble_of(encoded_bytes[19])]));
};

const swap_keys_and_values = (object) =>
	Object.fromEntries(Object.entries(object).map(([key, value]) => [value, key]))

const convert_facelets = (facelets, [facelet_index_mapping, facelet_value_mapping]) =>
	Array.from({...swap_keys_and_values(facelet_index_mapping), length:facelets.length}, (facelet_index) => facelet_value_mapping[facelets[facelet_index]])

const wachino_to_oyooyo_mappings = [
	[
		36, 37, 38, 39, 40, 41, 42, 43, 44, 15, 12,  9, 16, 13, 10, 17, 14, 11,
		53, 52, 51, 50, 49, 48, 47, 46, 45, 26, 25, 24, 23, 22, 21, 20, 19, 18,
		29, 32, 35, 28, 31, 34, 27, 30, 33,  0,  1,  2,  3,  4,  5,  6,  7,  8,
	],
	{1:'F', 2:'D', 3:'R', 4:'U', 5:'L', 6:'B'},
];

const convert_wachino_facelets_to_oyooyo_facelets = (wachino_facelets) =>
	convert_facelets(wachino_facelets, wachino_to_oyooyo_mappings).join('')

const oyooyo_to_cubejs_mappings = [
	[
		 0,  1,  2,  3,  4,  5,  6,  7,  8, 36, 37, 38, 39, 40, 41, 42, 43, 44,
		18, 19, 20, 21, 22, 23, 24, 25, 26,  9, 10, 11, 12, 13, 14, 15, 16, 17,
		45, 46, 47, 48, 49, 50, 51, 52, 53, 27, 28, 29, 30, 31, 32, 33, 34, 35,
	],
	{'U':'U', 'L':'L', 'F':'F', 'R':'R', 'B':'B', 'D':'D'},
];

const convert_oyooyo_facelets_to_cubejs_facelets = (oyooyo_facelets) =>
	convert_facelets(Array.from(oyooyo_facelets), oyooyo_to_cubejs_mappings).join('')

const OYOYO_SOLVED_FACELETS = 'UUUUUUUUULLLLLLLLLFFFFFFFFFRRRRRRRRRBBBBBBBBBDDDDDDDDD';

export {convert_decoded_bytes_to_wachino_facelets, convert_oyooyo_facelets_to_cubejs_facelets, convert_wachino_facelets_to_oyooyo_facelets, decode_encoded_bytes, OYOYO_SOLVED_FACELETS};
