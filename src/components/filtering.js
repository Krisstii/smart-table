import { createComparison, defaultRules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach((elementName) => {
        if (elements[elementName]) {
            elements[elementName].append(
                ...Object.values(indexes[elementName]).map(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    return option;
                })
            );
        }
    });

    // @todo: #4.3 — настроить компаратор
    const compare = createComparison(defaultRules);

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const fieldName = action.dataset.field;
            const parentEl = action.parentElement;
            const inputElement = parentEl.querySelector('input');

            if (inputElement) {
                inputElement.value = '';
            }
            if (fieldName) {
                state[fieldName] = '';
            }
        }

        // --- ПОДГОТОВКА СОСТОЯНИЯ ДЛЯ КОМПАРАТОРА ---
        const filterState = {};

        // 1. Дата (если в HTML поле называется name="date")
        if (state.date) {
            filterState.date = state.date;
        }

        // 2. Покупатель (если в HTML поле называется name="customer")
        if (state.customer) {
            filterState.customer = state.customer;
        }

        // 3. Продавец (в форме 'searchBySeller', в данных 'seller')
        if (state.searchBySeller) {
            filterState.seller = state.searchBySeller;
        }

        // 4. Сумма (в форме 'totalFrom' и 'totalTo', в данных 'total' как массив [от, до])
        const totalFrom = state.totalFrom ? parseFloat(state.totalFrom) : undefined;
        const totalTo = state.totalTo ? parseFloat(state.totalTo) : undefined;

        if (totalFrom !== undefined || totalTo !== undefined) {
            filterState.total = [totalFrom, totalTo];
        }

        // Если ни один фильтр не задан, возвращаем исходные данные без изменений
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
        // ВАЖНО: используем cleanData и filterState, а не data и state!
        return cleanData.filter(row => compare(row, filterState));
    };
}