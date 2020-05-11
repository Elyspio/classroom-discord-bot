import {google, sheets_v4} from "googleapis";
import readline from "readline"
import fs from "fs"
import credentials from "../config/google/index.json"

export namespace Google {
	import Sheets = sheets_v4.Sheets;

	export class Cell {
		row: number
		col: string
		value: string

		constructor(row: number, col: string, value: string) {
			this.row = row;
			this.col = col;
			this.value = value;
		}

		public offset(row: number, col: number): Cell {
			return new Cell(this.row + row, String.fromCharCode(this.col.charCodeAt(0) + col), this.value)
		}
	}

	export class Sheet {

		public static async
		private static _instances: Map<string, Sheet>;
		private static googleData = {
			scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
			tokenPath: 'token.json',
			sheetId: "1iX4Fi7X00A86Z4wwKS4uhmE-WdH3qFPSYnqIWHHVibY"
		}
		private internalSheet: string[][] = []
		private google: Sheets;

		private constructor() {
			this.google = google.sheets("v4");
		}

		public static async get(name: string, row: number, col: string): Promise<Cell> {

			const colIndex = col.charCodeAt(0) - "A".charCodeAt(0);

			return new Cell(row, col, (await Sheet.instance(name)).internalSheet[row][colIndex])
		}

		public static async find(name: string, value: string, criters?: { valueInRow?: string[], col?: string }): Promise<Google.Cell[]> {

			const original = value;
			value = Sheet.normalize(value);


			let candidates: Cell[] = [];

			let internalSheet = (await Sheet.instance(name)).internalSheet;
			for (let row = 0; row < internalSheet.length; row++) {
				for (let col = 0; col < internalSheet[row].length; col++) {
					if (Sheet.normalize(internalSheet[row][col]) === value) {
						candidates.push(new Cell(row, String.fromCharCode("A".charCodeAt(0) + col), original));
					}
				}
			}
			const indexToIgnore: number[] = [];


			if (criters?.valueInRow) {
				for (let i = 0; i < candidates.length; i++) {

					if (indexToIgnore.includes(i)) continue;

					let cell = candidates[i];
					const row = internalSheet[cell.row];
					if (criters.valueInRow.map(val => row.indexOf(val) !== -1).some(b => b === false)) {
						indexToIgnore.push(i);
					}
				}
			}
			if (criters?.col) {
				candidates = candidates.filter((cell, index) => !indexToIgnore.includes(index) && cell.col === criters.col)
			}


			return candidates.filter((cell, index) => indexToIgnore.includes(index) === false);
		}

		private static normalize(str: string): string {
			return str.trim().replace(/ /g, "_").toLowerCase().replace(/[éèêë]/g, "e");
		}

		private static async instance(name: string): Promise<Sheet> {
			if (!this._instances) {
				this._instances = new Map();
			}


			if (!this._instances.has(name)) {
				this._instances.set(name, new Sheet());
				await this._instances.get(name).init(name)
			}
			return this._instances.get(name) as Sheet;

		}

		private async authorize(credentials) {
			const {client_secret, client_id, redirect_uris} = credentials.installed;
			const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

			try {
				const token = await fs.promises.readFile(Sheet.googleData.tokenPath);
				oAuth2Client.setCredentials(JSON.parse(token.toString()));
				return oAuth2Client;
			} catch (e) {
				return this.getNewToken(oAuth2Client);
			}
		}

		private getNewToken = oAuth2Client => new Promise(resolve => {
			const authUrl = oAuth2Client.generateAuthUrl({
				access_type: 'offline',
				scope: Sheet.googleData.scopes,
			});
			console.log('Authorize this app by visiting this url:', authUrl);
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});
			rl.question('Enter the code from that page here: ', (code) => {
				rl.close();
				oAuth2Client.getToken(code, (err, token) => {
					if (err) return console.error('Error while trying to retrieve access token', err);
					oAuth2Client.setCredentials(token);
					// Store the token to disk for later program executions
					fs.writeFile(Sheet.googleData.tokenPath, JSON.stringify(token), (err) => {
						if (err) return console.error(err);
						console.log('Token stored to', Sheet.googleData.tokenPath);
					});
					resolve(oAuth2Client);
				});
			});
		});

		private async init(sheet: string) {

			await this.authorize(credentials)
			return new Promise(resolve => {
				this.google.spreadsheets.values.get({
					range: `'${sheet}'!A:Z`,
					spreadsheetId: Sheet.googleData.sheetId,
					key: credentials.apiKey
				}, (err, res) => {

					this.internalSheet = res.data.values;
					resolve()
				})
			})


		}

	}
}
