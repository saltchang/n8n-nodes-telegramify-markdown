import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import telegramifyMarkdown from 'telegramify-markdown';

export class TelegramifyMarkdown implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Telegramify Markdown',
		name: 'telegramifyMarkdown',
		group: ['transform', 'utility', 'text', 'markdown', 'telegram'],
		version: 1,
		icon: 'file:telegramify-markdown.svg',
		description: 'Telegramify Markdown',
		defaults: {
			name: 'Telegramify Markdown',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '={{ $json.output }}',
				placeholder: 'Enter text to convert to Telegram Markdown',
				description: 'The text to convert to Telegram Markdown',
				required: true,
			},
			{
				displayName: 'Output Field',
				name: 'outputField',
				type: 'string',
				default: 'output',
				description: 'The field to output the converted text to',
				required: true,
			},
			{
				displayName: 'Escape Mode',
				name: 'escapeMode',
				type: 'options',
				description: 'Unsupported tags strategy as a second argument, which can be one of the following: "escape" (escape unsupported symbols for unsupported tags), "remove" (remove unsupported tags), "keep" (ignore unsupported tags), default: "remove"',
				options: [
					{
						name: 'Escape',
						value: 'escape',
					},
					{
						name: 'Remove',
						value: 'remove',
					},
					{
						name: 'Keep',
						value: 'keep',
					},
				],
				default: 'remove',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const inputText = this.getNodeParameter('text', itemIndex, '') as string;
				const escapeMode = this.getNodeParameter('escapeMode', itemIndex, 'remove') as 'keep' | 'remove' | 'keep';
				const outputField = this.getNodeParameter('outputField', itemIndex, '') as string;
				item = items[itemIndex];

				item.json[outputField] = telegramifyMarkdown(inputText, escapeMode);
				item.json.escape_mode = escapeMode;
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
