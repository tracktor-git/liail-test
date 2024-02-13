const sortAsc = (a, b) => a.sorthead - b.sorthead;

const createTree = (data, id, parent, parentId) => {	
	return data
		.reduce((acc, item) => {
			if (parentId === item[parent]) {
				const newItem = {
					...item,
					children: createTree(data, id, parent, item[id]),
				};
				return [...acc, newItem];
			}
			return acc;
		}, [])
		.sort(sortAsc);
}

const formatPrice = (price) => {
	if (!price) {
		return '';
	}

	const formattedPrice = price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
	return ` (${formattedPrice})`;
};

const buildHtmlTree = (tree) => {
	const ul = document.createElement('ul');

	tree.forEach(({ price, name, children, node }) => {
		const li = document.createElement('li');
		const div = document.createElement('div');
		const span = document.createElement('span');
		const link = document.createElement('a');

		link.href = '#';
		link.textContent = `${name}${formatPrice(price)}`;

		span.classList.add('icon');

		if (!node) {
			span.classList.add('empty');
		}

		div.append(span);
		div.append(link);
		li.append(div);
		ul.append(li);

		if (children.length) {
			li.classList.add('parent');
			li.append(buildHtmlTree(children));
		}
	});

	return ul;
};

const getData = async (url) => {
	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Не удалось получить данные:', error.message);
	}
};

const app = async () => {
	const treeElement = document.querySelector('.tree');
	const { services } = await getData('./data.json');
	const tree = createTree(services, 'id', 'head', null);
	const htmlTree = buildHtmlTree(tree);

	treeElement.append(htmlTree);

	treeElement.addEventListener('click', (event) => {
		event.preventDefault();
		const parent = event.target.parentNode.parentNode;
		if (parent.classList.contains('parent')) {
			parent.classList.toggle('opened');
		}
	});
};

app();
