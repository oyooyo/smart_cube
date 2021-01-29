import {convert_decoded_bytes_to_wachino_facelets, convert_wachino_facelets_to_oyooyo_facelets, decode_encoded_bytes} from './mi_smart_magic_cube_utils';

const async_get_device = async (device) =>
	(device
		? device
		: (await navigator.bluetooth.requestDevice({
			// The following filter doesn't work properly, and I don't yet know why.
			// For some reason, the cube is shown as 'Mi Smart Magic Cube' during scanning for BLE devices on my Linux PC,
			// but on my Android smartphone, the device is shown as not having a name.
			/*
			filters: [{
				name: 'Mi Smart Magic Cube',
			}],
			*/
			// So until a better way is discovered that works in both environments, it seems necessary to scan for all BLE devices,
			// which is far from ideal because it's not apparent during scanning which of the found devices is the cube.
			acceptAllDevices: true,
			optionalServices: [0xAADB],
		}))
	)

const async_get_server = async (device) =>
	(await (await async_get_device(device)).gatt.connect())

const async_get_service = async (device) =>
	(await (await async_get_server(device)).getPrimaryService(0xAADB))

const async_get_characteristic = async (device) =>
	(await (await async_get_service(device)).getCharacteristic(0xAADC))

const async_subscribe_to_dataview = async (callback, device) => {
	const characteristic = await async_get_characteristic(device);
	await characteristic.startNotifications();
	characteristic.addEventListener('characteristicvaluechanged', (event) => {
		callback(event.target.value);
	});
}

const dataview_to_uint8array = (dataview) => 
	(new Uint8Array(dataview.buffer))

const async_subscribe_to_encoded_bytes = async (callback, device) => {
	await async_subscribe_to_dataview((dataview) => {
		callback(dataview_to_uint8array(dataview));
	}, device);
}

const async_subscribe_to_decoded_bytes = async (callback, device) => {
	await async_subscribe_to_encoded_bytes((encoded_bytes) => {
		callback(decode_encoded_bytes(encoded_bytes));
	}, device);
}

const async_subscribe_to_wachino_facelets = async (callback, device) => {
	await async_subscribe_to_decoded_bytes((decoded_bytes) => {
		callback(convert_decoded_bytes_to_wachino_facelets(decoded_bytes));
	}, device);
}

const async_subscribe_to_oyooyo_facelets = async (callback, device) => {
	await async_subscribe_to_wachino_facelets((wachino_facelets) => {
		callback(convert_wachino_facelets_to_oyooyo_facelets(wachino_facelets));
	}, device);
}

export {async_subscribe_to_decoded_bytes, async_subscribe_to_encoded_bytes, async_subscribe_to_oyooyo_facelets, async_subscribe_to_wachino_facelets};
