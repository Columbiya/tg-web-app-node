const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const cors = require('cors')

const token = "5854585882:AAEUeHExIzH2eRTz-hQFALEY7dVU7Uu3e1A" //лучше в переменную окружения
const webAppUrl = 'https://fantastic-cuchufli-d74cce.netlify.app'

const bot = new TelegramBot(token, {polling: true});
const app = express()

app.use(express.json())
app.use(cors())

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
        reply_markup: {
            inline_keyboard: [ //keyboard кнопка
                [{text: "Сделать заказ", web_app: {url: webAppUrl}}]
            ]
        }
    })

    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
            keyboard: [ //keyboard кнопка
                [{text: "Открыть форму", web_app: {url: webAppUrl + "/form"}}]
            ]
        }
    })
  }

    if (msg?.web_app_data?.data) {
        try {
            const data  = JSON.parse(msg.web_app_data.data)

            console.log(data)

            await bot.sendMessage(chatId, "Спасибо за обратную связь!")
            await bot.sendMessage(chatId, "Ваша страна: " + data?.country)
            await bot.sendMessage(chatId, "Ваша улица: " + data?.street)

            setTimeout(async () => {
                await bot.sendMessage(chatId, "Всю информацию вы получите в этом чате")
            }, 3000)
        } catch(e) {
            console.log(e)
        }
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Поздравляю с покупкой! Вы купили на сумму ${totalPrice}`
            }
        })

        res.status(200).json({})
    } catch(e) {
        console.log(e)

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: {
                message_text: `Не удалось приобрести товар`
            }
        })

        res.status(500).json({})
    }

})

const PORT = 8000

app.listen(PORT, () => console.log(`server up on port ${PORT}`))