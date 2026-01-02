const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { getUserData, updateUserData } = require('../../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bank')
        .setDescription('Manage your bank account.')
        .addSubcommand(sub => sub.setName('balance').setDescription('View account details'))
        .addSubcommand(sub => 
            sub.setName('deposit')
               .setDescription('Deposit money')
               .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('withdraw')
               .setDescription('Withdraw money')
               .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('upgrade')
               .setDescription('Increase bank limit (Cost: 2000)')
        )
        .addSubcommand(sub => 
            sub.setName('borrow')
               .setDescription('Borrow money (Credit Card)')
               .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('repay')
               .setDescription('Repay credit card debt')
               .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true))
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const data = getUserData(userId);

        if (data.arrested && sub !== 'repay') {
             return interaction.reply({ content: "🚔 You are arrested! You can only use `/bank repay`.", ephemeral: true });
        }

        if (sub === 'balance') {
            const embed = new EmbedBuilder()
                .setTitle(`🏦 Bank of Gat0`)
                .addFields(
                    { name: 'Wallet', value: `${data.balance}`, inline: true },
                    { name: 'Bank', value: `${data.bank} / ${data.bankLimit}`, inline: true },
                    { name: 'Debt', value: `${data.debt}`, inline: true },
                    { name: 'Education', value: `Level ${data.education}`, inline: true }
                )
                .setColor(Colors.Green);
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'deposit') {
            const amount = interaction.options.getInteger('amount');
            if (amount <= 0) return interaction.reply({ content: "Invalid amount.", ephemeral: true });
            if (data.balance < amount) return interaction.reply({ content: "Insufficient funds in wallet.", ephemeral: true });
            if (data.bank + amount > data.bankLimit) return interaction.reply({ content: "Bank limit reached! Upgrade your bank.", ephemeral: true });

            updateUserData(userId, { 
                balance: data.balance - amount, 
                bank: data.bank + amount 
            });
            return interaction.reply(`✅ Deposited **${amount}**.`);
        }

        if (sub === 'withdraw') {
            const amount = interaction.options.getInteger('amount');
            if (amount <= 0) return interaction.reply({ content: "Invalid amount.", ephemeral: true });
            if (data.bank < amount) return interaction.reply({ content: "Insufficient funds in bank.", ephemeral: true });

            updateUserData(userId, { 
                balance: data.balance + amount, 
                bank: data.bank - amount 
            });
            return interaction.reply(`✅ Withdrew **${amount}**.`);
        }

        if (sub === 'upgrade') {
            const cost = 2000;
            if (data.balance < cost) return interaction.reply({ content: `❌ Need **${cost}** to upgrade.`, ephemeral: true });
            
            updateUserData(userId, { 
                balance: data.balance - cost, 
                bankLimit: data.bankLimit + 1000 
            });
            return interaction.reply(`🔼 Bank limit increased to **${data.bankLimit + 1000}**.`);
        }

        if (sub === 'borrow') {
            const amount = interaction.options.getInteger('amount');
            const limit = 5000 * (data.education + 1);
            if (amount <= 0) return interaction.reply({ content: "Invalid amount.", ephemeral: true });
            if (data.debt + amount > limit) return interaction.reply({ content: `❌ Credit limit exceeded (Max: ${limit}).`, ephemeral: true });

            updateUserData(userId, { 
                balance: data.balance + amount, 
                debt: data.debt + amount,
                lastPayment: new Date().toISOString() 
            });
            return interaction.reply(`💳 Borrowed **${amount}**. Pay it back soon!`);
        }

        if (sub === 'repay') {
            const amount = interaction.options.getInteger('amount');
            if (amount <= 0) return interaction.reply({ content: "Invalid amount.", ephemeral: true });
            if (data.balance < amount) return interaction.reply({ content: "Insufficient funds.", ephemeral: true });
            if (data.debt === 0) return interaction.reply({ content: "You have no debt!", ephemeral: true });

            const pay = Math.min(amount, data.debt);
            const newData = {
                balance: data.balance - pay,
                debt: data.debt - pay
            };
            
            if (newData.debt === 0) {
                newData.arrested = false; 
                newData.lastPayment = new Date().toISOString();
            }

            updateUserData(userId, newData);
            return interaction.reply(`💸 Repaid **${pay}**. Remaining debt: **${newData.debt}**.`);
        }
    },
};
