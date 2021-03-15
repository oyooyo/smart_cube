import React from 'react';
import {BoxGeometry, Color, ConeGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const RADIAL_SEGMENTS = 16;

const STICKER_HEIGHT = (1 / 256);

const STICKER_LENGTH = 0.875;

const V1 = Math.PI;

const V2 = (V1 / 2);

const V3 = 2.5;

const ROTATIONS = {
	"U":[[0, 0, 1], [V2, 0, 0]],
	"U'":[[0, 0, 1], [-V2, 0, 0]],
	"U2":[[0, 0, 1], [V2, 0, 0]],
	"L":[[-1, 0, 0], [0, 0, V2]],
	"L'":[[-1, 0, 0], [0, 0, -V2]],
	"L2":[[-1, 0, 0], [0, 0, V2]],
	"F":[[0, -1, 0], [0, 0, V1]],
	"F'":[[0, -1, 0], [0, 0, 0]],
	"F2":[[0, -1, 0], [0, 0, V1]],
	"R":[[1, 0, 0], [0, 0, -V2]],
	"R'":[[1, 0, 0], [0, 0, +V2]],
	"R2":[[1, 0, 0], [0, 0, -V2]],
	"B":[[0, 1, 0], [0, 0, 0]],
	"B'":[[0, 1, 0], [0, 0, V1]],
	"B2":[[0, 1, 0], [0, 0, 0]],
	"D":[[0, 0, -1], [-V2, 0, 0]],
	"D'":[[0, 0, -1], [V2, 0, 0]],
	"D2":[[0, 0, -1], [-V2, 0, 0]],

	"S":[[0, 0, 0], [0, 0, V1]],
	"S'":[[0, 0, 0], [0, 0, 0]],
	"S2":[[0, 0, 0], [0, 0, V1]],
	"E":[[0, 0, 0], [-V2, 0, 0]],
	"E'":[[0, 0, 0], [V2, 0, 0]],
	"E2":[[0, 0, 0], [-V2, 0, 0]],
	"M":[[0, 0, 0], [0, 0, V2]],
	"M'":[[0, 0, 0], [0, 0, -V2]],
	"M2":[[0, 0, 0], [0, 0, V2]],
};

const SIDES = [
	// Side 0: Up (White)
	[[-1, 1, 1.5], [1, 0, 0], [0, -1, 0], 0xFFFFFF],
	// Side 1: Left (Orange)
	[[-1.5, 1, 1], [0, -1, 0], [0, 0, -1], 0xFF8000],
	// Side 2: Front (Green)
	[[-1, -1.5, 1], [1, 0, 0], [0, 0, -1], 0x00FF00],
	// Side 3: Right (Red)
	[[1.5, -1, 1], [0, 1, 0], [0, 0, -1], 0xFF0000],
	// Side 4: Back (Blue)
	[[1, 1.5, 1], [-1, 0, 0], [0, 0, -1], 0x0000FF],
	// Side 5: Down (Yellow)
	[[-1, -1, -1.5], [1, 0, 0], [0, 1, 0], 0xFFFF00],
];

const SIDE_IDS = {
	'U':0,
	'L':1,
	'F':2,
	'R':3,
	'B':4,
	'D':5,
};

const side_id_to_color = (side_id) =>
	SIDES[SIDE_IDS[side_id]][3]

const divide_without_remainder = (number, divisor) =>
	Math.floor(number / divisor)

const divide_with_remainder = (number, divisor) =>
	[divide_without_remainder(number, divisor), (number % divisor)]

const vector3_add = (vector3_1, vector3_2) =>
	[(vector3_1[0] + vector3_2[0]), (vector3_1[1] + vector3_2[1]), (vector3_1[2] + vector3_2[2])]

const vector3_scalar_multiply = (vector3, scalar) =>
	[(vector3[0] * scalar), (vector3[1] * scalar), (vector3[2] * scalar)]

const sticker_size = (value) =>
	((Math.abs(value) > 1) ? STICKER_HEIGHT : STICKER_LENGTH);

const create_sticker = (x=0, y=0, z=0, color=0x808080) => {
	const geometry = (new BoxGeometry(sticker_size(x), sticker_size(y), sticker_size(z)));
	const material = (new MeshBasicMaterial({color:color}));
	const sticker = (new Mesh(geometry, material));
	sticker.position.set(x, y, z);
	return sticker;
}

const create_stickers = () => {
	const stickers = []
	for (let sticker_index = 0; (sticker_index < 54); sticker_index++) {
		const [side_index, sticker_in_side_index] = divide_with_remainder(sticker_index, 9);
		const [row_index, column_index] = divide_with_remainder(sticker_in_side_index, 3);
		const [side_offset, column_delta, row_delta, color] = SIDES[side_index];
		const sticker_position = vector3_add(vector3_add(side_offset, vector3_scalar_multiply(row_delta, row_index)), vector3_scalar_multiply(column_delta, column_index));
		const sticker = create_sticker(...sticker_position, color);
		stickers.push(sticker);
	}
	return stickers;
}

const create_arrow = (rotation) => {
	const cone_geometry = (new ConeGeometry(0.25, 1.0, RADIAL_SEGMENTS));
	cone_geometry.rotateZ(V2);
	cone_geometry.translate(0, 0, V3);
	const cone = (new Mesh(cone_geometry, (new MeshBasicMaterial({color:0xFFFFFF, opacity:0.75, transparent:true}))));
	cone.rotation.set(0, -rotation, 0);
	return cone;
}

const create_arrows_object = () => {
	const group = (new Group());
	for (let i=0; i < 8; i++) {
		group.add(create_arrow((V1 * i) / 4));
	}
	return group;
}

const CubeDisplay = class extends React.Component {
	constructor(props) {
		super(props);
		this.stickers = create_stickers();
		this.arrows_object = create_arrows_object();
		this.rotation_object = (new Group());
		this.rotation_object.add(this.arrows_object);
		this.rotation_object.add(new Mesh((new BoxGeometry(3.01, 1.01, 3.01)), (new MeshBasicMaterial({color:0xFFFFFF, opacity:0.75, transparent:true}))));
		this.frame_index = 0;
	}
	componentDidMount() {
		const mount = this.mount;
		let width = mount.clientWidth;
		let height = mount.clientHeight;
		const scene = (new Scene());
		const camera = (new PerspectiveCamera(60, (width / height), 0.1, 100));
		camera.up.set(0, 0, 1);
		camera.position.set(4, -5, 4);
		const renderer = (new WebGLRenderer({
			antialias: true,
		}));
		renderer.setSize(width, height);
		const canvas_element = renderer.domElement;
		mount.appendChild(canvas_element);
		const orbit_controls = (new OrbitControls(camera, canvas_element));
		scene.background = (new Color(0x406080));
		scene.add(new Mesh((new BoxGeometry(3, 3, 3)), (new MeshBasicMaterial({color:0x202020}))));
		for (let sticker of this.stickers) {
			scene.add(sticker);
		}
		scene.add(this.rotation_object);
		const animate = () => {
			requestAnimationFrame(animate);
			const new_width = mount.clientWidth;
			const new_height = mount.clientHeight;
			if ((new_width !== width) || (new_height !== height)) {
				camera.aspect = (new_width / new_height);
				camera.updateProjectionMatrix();
				renderer.setSize(new_width, new_height);
				width = new_width;
				height = new_height;
			}
			orbit_controls.update();
			this.arrows_object.rotation.set(0, -((this.frame_index * V1 / 120) % V1), 0);
			renderer.render(scene, camera);
			this.frame_index++;
		};
		animate();
	}
	render() {
		for (let sticker_index=0; (sticker_index < 54); sticker_index++) {
			const side_id = this.props.state[sticker_index];
			this.stickers[sticker_index].material.color.setHex(side_id_to_color(side_id));
		}
		if (this.props.rotation) {
			this.rotation_object.visible = true;
			const [position, rotation] = ROTATIONS[this.props.rotation];
			this.rotation_object.position.set(...position);
			this.rotation_object.rotation.set(...rotation);
		} else {
			this.rotation_object.visible = false;
		}
		return (
			<div
				className="cube_display"
				ref={(ref) => {this.mount = ref}}
			/>
		);
	}
}

export default CubeDisplay;
