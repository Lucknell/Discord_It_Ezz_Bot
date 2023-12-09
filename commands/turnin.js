const { SlashCommandBuilder } = require('discord.js');
const grades = require('../grades.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('turnin')
		.setDescription('Work on your failure!')
		.addStringOption(option =>
			option.setName('grade')
				.setDescription('The to turn in')
				.setRequired(true).addChoices(
					{ name: 'Math', value: 'math' },
					{ name: 'Reading', value: 'reading' },
					{ name: 'English', value: 'english' },
					{ name: 'History', value: 'history' },
					{ name: 'Science', value: 'science' },
					{ name: 'Music', value: 'music' })),
	async execute(interaction) {
		await grades.turnIn(interaction);
	},
};
