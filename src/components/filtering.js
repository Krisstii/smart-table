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
        // Копируем state, чтобы не мутировать исходный объект и взять все введенные значения
        const filterState = { ...state };

        // 1. Привязываем searchBySeller из формы к полю seller в данных
        if (filterState.searchBySeller !== undefined) {
            filterState.seller = filterState.searchBySeller;
            delete filterState.searchBySeller;
        }

        // 2. На случай, если в HTML поля называются с префиксом filter (а в данных без него)
        if (filterState.filterDate !== undefined) {
            filterState.date = filterState.filterDate;
            delete filterState.filterDate;
        }
        if (filterState.filterCustomer !== undefined) {
            filterState.customer = filterState.filterCustomer;
            delete filterState.filterCustomer;
        }

        // 3. Собираем totalFrom и totalTo в массив [от, до] для правила arrayAsRange
        const totalFrom = filterState.totalFrom ? parseFloat(filterState.totalFrom) : undefined;
        const totalTo = filterState.totalTo ? parseFloat(filterState.totalTo) : undefined;

        if (totalFrom !== undefined || totalTo !== undefined) {
            filterState.total = [totalFrom, totalTo];
        }
        delete filterState.totalFrom;
        delete filterState.totalTo;

        // 4. Удаляем служебные поля управления, которые не должны участвовать в фильтрации данных
        delete filterState.page;
        delete filterState.rowsPerPage;
        delete filterState.sortBy;
        delete filterState.sortOrder;
        delete filterState.search; // поиск обрабатывается отдельно в applySearching

        // Проверяем, остались ли какие-либо активные фильтры (не пустые строки и не undefined)
        const activeFilters = Object.keys(filterState).filter(
            key => filterState[key] !== '' && filterState[key] !== undefined
        );

        // Если активных фильтров нет, возвращаем исходные данные без изменений
        if (activeFilters.length === 0) {
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
        // ВАЖНО: используем cleanData и filterState
        return cleanData.filter(row => compare(row, filterState));
    };
}