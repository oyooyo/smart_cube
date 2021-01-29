import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import React from 'react';
import {async_subscribe_to_oyooyo_facelets} from './mi_smart_magic_cube_webbluetooth';
import {convert_oyooyo_facelets_to_cubejs_facelets} from './mi_smart_magic_cube_utils';
import CubeDisplay from './CubeDisplay';
const CubeJS = window.Cube;

const PleaseWaitMessage = ({children}) =>
	<div className="text-center">
		<div className="spinner-border" role="status">
			<span className="visually-hidden">Please wait...</span>
		</div>
		<div className="mt-3">
			{children}
		</div>
	</div>

const CubeSolver = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id:'initializing_solver',
			facelets:null,
			rotations:null,
		};
	}
	componentDidMount() {
		CubeJS.asyncInit('cubejs/worker.js', () => {
			this.setState({id:'waiting_for_user_gesture'});
		});
	}
	on_cube_state_change(facelets) {
		const old_facelets = this.state.facelets;
		this.setState({facelets:facelets});
		const new_cube = CubeJS.fromString(convert_oyooyo_facelets_to_cubejs_facelets(facelets));
		if (new_cube.isSolved()) {
			this.setState({id:'solved', rotations:[]});
		} else {
			if (this.state.rotations && (this.state.rotations.length > 0)) {
				const old_cube = CubeJS.fromString(convert_oyooyo_facelets_to_cubejs_facelets(old_facelets));
				old_cube.move(this.state.rotations[0]);
				if (new_cube.asString() === old_cube.asString()) {
					this.setState({id:'displaying_next_rotation', rotations:this.state.rotations.slice(1)});
					return;
				}
			}
			this.setState({id:'solving', rotations:null});
			new_cube.asyncSolve((cubejs_rotations_string) => {
				for (let layer_id of ['U', 'L', 'F', 'R', 'B', 'D', 'S', 'E', 'M']) {
					cubejs_rotations_string = cubejs_rotations_string.replaceAll(`${layer_id}2`, `${layer_id} ${layer_id}`);
				}
				this.setState({id:'displaying_next_rotation', rotations:cubejs_rotations_string.trim().split(' ')});
			});
		}
	}
	render() {
		switch(this.state.id) {
			case 'initializing_solver':
				return (
					<PleaseWaitMessage>
						Initializing Rubik's Cube Solver...
					</PleaseWaitMessage>
				);
			case 'waiting_for_user_gesture':
				return (
					('bluetooth' in navigator) 
					? (
						<div>
							<div>
								<p>
									Rotate the Mi Smart Magic Cube (to ensure it is turned on), then click the button below to connect to it. A new dialogue will open, showing all Bluetooth LE devices in range, and asking you to select the device.
								</p>
								<div className="alert alert-warning" role="alert">
									Unfortunately, it can be hard to indentify which one of the shown devices the Mi Smart Magic Cube is. The device may show up as "Mi Smart Magic Cube", in which case choosing is simple. If there is no device with that name, it will be one of the devices that are shown without a name. If there are multiple, the signal strength indicator may help - place the cube next to your device, and the signal strength should be very high.
								</div>
							</div>
							<div className="d-grid mt-3">
								<button className="btn btn-primary" type="button" onClick={() => {
									this.setState({id:'connecting'});
									async_subscribe_to_oyooyo_facelets((facelets) => {
										this.on_cube_state_change(facelets);
									});
								}}>
									Connect to Mi Smart Magic Cube
								</button>
							</div>
						</div>
					)
					: (
						<div className="alert alert-danger" role="alert">
							Sorry, a webbrowser that supports the Web Bluetooth API is required. Right now, recent Chrome-based webbrowsers are the only ones that do.
						</div>
					)
				);
			case 'connecting':
				return (
					<PleaseWaitMessage>
						Connecting to Mi Smart Magic Cube...
					</PleaseWaitMessage>
				);
			case 'solving':
				return (
					<PleaseWaitMessage>
						Solving...
					</PleaseWaitMessage>
				);
			case 'displaying_next_rotation':
				return (
					<CubeDisplay state={this.state.facelets} rotation={this.state.rotations[0]} />
				);
			case 'solved':
				return (
					<CubeDisplay state={this.state.facelets} />
				);
			default:
				throw (new Error(`Invalid state ID ${this.state.id}`));
		}
	}
}

const App = () =>
	<div className="App container-fluid">
		<CubeSolver />
	</div>

export default App;
