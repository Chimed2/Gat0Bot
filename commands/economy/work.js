const { SlashCommandBuilder, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { addBalance, getCooldown, setCooldown, getUserData } = require('../../utils/economy');
const { EDUCATION_LEVELS } = require('./school');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work a shift (Minigame included).'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = getUserData(userId);
        
        
        if (data.arrested) {
            return interaction.reply({ content: "🚔 You are under arrest for debt evasion! You cannot work.", ephemeral: true });
        }

        const lastWork = getCooldown(userId, 'lastWork');
        const now = new Date();
        const cooldownTime = 10 * 60 * 1000; 

        if (lastWork && (now - lastWork) < cooldownTime) {
            const remaining = cooldownTime - (now - lastWork);
            const minutes = Math.floor(remaining / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            return interaction.reply({ content: `🕒 Work again in **${minutes}m ${seconds}s**.`, ephemeral: true });
        }

        const level = data.education || 0;
        const jobTitle = EDUCATION_LEVELS[level].name + " Graduate Job";
        
        
        const num1 = Math.floor(Math.random() * (10 * (level + 1))) + 1;
        const num2 = Math.floor(Math.random() * (10 * (level + 1))) + 1;
        const correctAnswer = num1 + num2;
        
        
        const wrong1 = correctAnswer + Math.floor(Math.random() * 5) + 1;
        const wrong2 = correctAnswer - Math.floor(Math.random() * 5) - 1;
        const wrong3 = correctAnswer + 10;

        const options = [correctAnswer, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);

        const row = new ActionRowBuilder()
            .addComponents(
                options.map((opt, i) => 
                    new ButtonBuilder()
                        .setCustomId(`work_${opt}`)
                        .setLabel(opt.toString())
                        .setStyle(ButtonStyle.Primary)
                )
            );

        const embed = new EmbedBuilder()
            .setTitle(`🔨 Work Shift: ${jobTitle}`)
            .setDescription(`Solve this to get paid:\n**${num1} + ${num2} = ?**`)
            .setColor(Colors.Blue);

        const response = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10000 });

        collector.on('collect', async i => {
            if (i.user.id !== userId) {
                return i.reply({ content: "This isn't your shift!", ephemeral: true });
            }

            const selected = parseInt(i.customId.split('_')[1]);
            
            if (selected === correctAnswer) {
                const basePay = 50 * (level + 1);
                const variance = Math.floor(Math.random() * 20);
                const pay = basePay + variance;
                
                addBalance(userId, pay);
                setCooldown(userId, 'lastWork');
                
                await i.update({ content: `✅ Correct! You earned **${pay} gat0bucks**.`, components: [], embeds: [] });
            } else {
                setCooldown(userId, 'lastWork'); 
                await i.update({ content: `❌ Wrong! You tripped and fell. No pay.`, components: [], embeds: [] });
            }
            collector.stop();
        });

        collector.on('end', collected => {
            if (collector.endReason === 'time') {
                interaction.editReply({ content: "⏰ Time's up! You were too slow.", components: [], embeds: [] });
                setCooldown(userId, 'lastWork');
            }
        });
    },
};