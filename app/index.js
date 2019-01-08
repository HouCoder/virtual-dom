const $app = document.querySelector('.app');

function dom(type, props, ...children) {
    return {type, props, children};
}

function generateDom(domObj) {
    let el;

    if (domObj.type) {
        el = document.createElement(domObj.type);
    } else {
        el = document.createTextNode(domObj);
    }

    if (domObj.props) {
        const propNameMap = {
            class: 'className',
        };

        Object.keys(domObj.props).forEach((key) => {
            const attributeName = propNameMap[attributeName] ? propNameMap[attributeName] : key;

            el.setAttribute(attributeName, domObj.props[key]);
        });
    }

    if (domObj.children) {
        domObj.children.forEach(child => el.appendChild(generateDom(child)));
    }

    return el;
}

const types = {
    get: type => Object.prototype.toString.call(type),
    string: '[object String]',
    number: '[object Number]',
    array: '[object Array]',
    object: '[object Object]',
    function: '[object Function]',
    null: '[object Null]',
    undefined: '[object Undefined]',
    boolean: '[object Boolean]',
};

// Only works for string and object
function isObjChanged(obj1, obj2) {
    // Different data types
    if (types.get(obj1) !== types.get(obj2)) {
        return true;
    }

    // Diff objects
    if (types.get(obj1) === types.object) {
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj1);

        if (obj1Keys.length !== obj2Keys.length) {
            return true;
        }

        // Empty object as no change
        if (obj1Keys.length === 0) {
            return false;
        }

        // Compare each item of objects
        for (let i = 0; i < obj1Keys.length; i++) {
            let key = obj1Keys[i];

            if (obj1[key] !== obj2[key]) {
                return true;
            }
        }
    }

    // Diff string
    if (types.get(obj1) === types.string) {
        return obj1 !== obj2;
    }

    return false;
}

function isNodeChanged(dom1, dom2) {
    if (types.get(dom1) === types.object && types.get(dom2) === types.object) {
        if (!isObjChanged(dom1.type, dom2.type) && !isObjChanged(dom1.props, dom2.props)
        ) {
            return false;
        } else {
            return true;
        }
    }

    return dom1 !== dom2;
}

function updateState($parent, oldNode, newNode, index = 0) {
    // Clear empty text node
    if ($parent.childNodes.length === 1 &&

        // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        $parent.childNodes[0].nodeType === 3 &&
        $parent.childNodes[0].data.trim() === ''
    ) {
        $parent.removeChild($parent.childNodes[0]);
    }

    // No new node, remove old node
    if (!newNode) {
        return $parent.removeChild($parent.childNodes[index]);
    }

    // No old node, append newNode
    if (!oldNode) {
        return $parent.appendChild(generateDom(newNode));
    }

    // Different node at the same place, replace oldNode with newNode
    if (isNodeChanged(oldNode, newNode)) {
        return $parent.replaceChild(
            generateDom(newNode),
            $parent.childNodes[index]
        );
    }

    // No change, need to go deeper
    if ((oldNode.children && oldNode.children.length)
        || (newNode.children && newNode.children.length)
    ) {
        let maxLength = Math.max.apply(
            null,
            [oldNode.children.length,
            newNode.children.length]
        );

        for (let i = 0; i < maxLength; i++) {
            updateState(
                $parent.childNodes[index],
                oldNode.children[i],
                newNode.children[i],
                i
            );
        }
    }
}

const activeProfile = <div>
    <div class="profile" id="profile">
        Django
    </div>
    <h1>Unchained</h1>
</div>;

const inactiveProfile = <div>
    <div class="profile" id="profile">
        Django
        <div>
            <div>
                Hello
                <div class="profile__message">Hello</div>
            </div>
        </div>
    </div>
</div>;

updateState($app, null, activeProfile);

const $updateDom = document.querySelector('.update-dom');

$updateDom.addEventListener('click', (e) => {
    updateState($app, activeProfile, inactiveProfile);
});
