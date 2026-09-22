# Свои тексты и фото

Для каждой истории можно держать обычный Markdown. Карта и страницы после загрузки подхватывают его поверх встроенных карточек.

## Как загрузить

1. Открой [http://localhost:3000/edit](http://localhost:3000/edit) при запущенном `npm run dev`.
2. Скачай текущий `.md` нужной страны.
3. Поправь текст у себя. Картинки приложи рядом: `hero.jpg`, `01.png` и так далее.
4. На той же странице загрузи `.md` и фото.

Либо положи файлы сюда и примени папку:

```
content/movements/zazous.md
content/movements/zazous/hero.jpg
```

```bash
npm run content:apply
```

Скачать все текущие статьи сразу:

```bash
npm run content:export
```

## Что писать в файле

- Шапка YAML — название, годы, тип, факты, хроника, источники, список картинок.
- Текст после `---` — вступление, потом разделы `## Заголовок`.
- Картинка в разделе: `![подпись](hero.jpg)`.
- Имена типов: `resistance`, `subculture`, `student`, `state`, `political`, `civic`, `militaryYouth`, `scouting`.

Образец: `content/movements/_template.md`.
