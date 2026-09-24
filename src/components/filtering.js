import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes)                                    // Получаем ключи из объекта
      .forEach((elementName) => {                        // Перебираем по именам
        elements[elementName].append(                    // в каждый элемент добавляем опции
            ...Object.values(indexes[elementName])        // формируем массив имён, значений опций
                      .map(name => {                        // используйте name как значение и текстовое содержимое
                            const option = document.createElement('option');
                            option.value = name;
                            option.textContent = name;
                            return option;
                                                        // @todo: создать и вернуть тег опции
                      })
        )
     })

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if(action && action.name === 'clear'){
            const fieldName = action.dataset.field;
            const parentel= action.parentElement;
            const inputElement = parentel.querySelector('input');
            // Сбрасываем значение в найденном поле ввода
        if (inputElement) {
            inputElement.value = '';
        }

        //  Сбрасываем значение в объекте state, чтобы перерисовка использовала пустое значение
        if (fieldName) {
            state[fieldName] = '';
        }
        }
// --- ПОДГОТОВКА СОСТОЯНИЯ ДЛЯ КОМПАРАТОРА ---
        // Нам нужно привести state к виду, который понимают defaultRules
        const filterState = {};

        // 1. Привязываем searchBySeller из формы к полю seller в данных
        if (state.searchBySeller) {
            filterState.seller = state.searchBySeller;
        }

        // 2. Объединяем totalFrom и totalTo в массив [от, до] для правила arrayAsRange
        const totalFrom = state.totalFrom ? parseFloat(state.totalFrom) : undefined;
        const totalTo = state.totalTo ? parseFloat(state.totalTo) : undefined;

        if (totalFrom !== undefined || totalTo !== undefined) {
            filterState.total = [totalFrom, totalTo];
        }

        // Если фильтры не заданы, возвращаем исходные данные
        if (Object.keys(filterState).length === 0) {
            return data;
        }

        // --- ОЧИСТКА ДАННЫХ ---
        // Превращаем строки с пробелами ("4 657.56") в числа (4657.56), 
        // чтобы математическое сравнение в arrayAsRange работало верно
        const cleanData = data.map(row => {
            const cleanRow = { ...row };
            if (typeof cleanRow.total === 'string') {
                cleanRow.total = parseFloat(cleanRow.total.replace(/\s/g, ''));
            }
            return cleanRow;
        });


        // @todo: #4.5 — отфильтровать данные используя компаратор
        return cleanData.filter(row => compare(row, filterState));

    }
}