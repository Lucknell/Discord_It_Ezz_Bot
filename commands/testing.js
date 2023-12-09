const { SlashCommandBuilder, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');
const util = require('../util.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('newtest')
		.setDescription('???'),
	async execute(interaction) {
		const userSelect = new UserSelectMenuBuilder()
			.setCustomId('users')
			.setPlaceholder('Select multiple users.')
			.setMinValues(1)
			.setMaxValues(10);

		const row1 = new ActionRowBuilder()
			.addComponents(userSelect);

		const response = await interaction.reply({
			content: 'Select users:',
			components: [row1],
		});
		const collectorFilter = i => i.user.id === interaction.user.id;
		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation.customId === 'users') {
				console.log(confirmation.users);
				confirmation.users.forEach(user => {
					console.log(user.id, user.bot)					
				});
				await confirmation.update({ content: `Something happened I think`, components: [] });
			}
		} catch (e) {
			console.log(e);
			await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		}
	},
};
