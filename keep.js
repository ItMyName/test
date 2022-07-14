
let egg = document.body
const log = console.log

function Rendering() {
    let elems = document.body.children
    for (let i = 0; i < elems.length; i++) {
        log(elems[i]);
    }
}
Rendering()




// ===============
// == 菜单对象
// ===============
class Menu {
    static #root
    static #title
    static #text
    static #input
    static #body
    static #tasks

    // 初始化函数，传入根节点
    // 参数：根节点 HtmlElemNode
    static init(rootElem) {
        rootElem.style.display = "none"
        rootElem.innerHTML = `<section><h2></h2><p></p><textarea style="display:none"></textarea><ul class="buttons"></ul></section>`
        this.#root = rootElem
        this.#title = rootElem.getElementsByTagName("h2")[0]
        this.#text = rootElem.getElementsByTagName("p")[0]
        this.#input = rootElem.getElementsByTagName("textarea")[0]
        this.#body = rootElem.getElementsByTagName("ul")[0]
        this.#tasks = []
    }



    // 通过回调函数，通过对应选项的下标传递
    // 参数:标题 string，信息文本 string，选项 array<string>，回调函数 func(num)，选项以列表形式显示 bool
    static show(title, text, options, callbackFunc, listStyle) {
        this.#tasks.push(() => {
            this.#body.className = listStyle ? "list" : "buttons"
            this.#title.innerText = title
            this.#text.innerText = text
            options.forEach(str => {
                this.#body.appendChild(document.createElement("LI")).innerText = str
            });
            this.#root.style.display = ""

            let f = (ev) => {
                if (ev.target.tagName != "LI") return
                for (let i = 0, str = ev.target.innerText; i < options.length; i++) {
                    if (options[i] == str) {
                        this.#body.removeEventListener("click", f)
                        this.#body.innerHTML = ""
                        this.#root.style.display = "none"

                        callbackFunc(i)
                        this.#tasks = this.#tasks.slice(1,)
                        if (this.#tasks.length != 0) {
                            setTimeout(this.#tasks[0])
                        }
                        return
                    }
                }
            }
            this.#body.addEventListener("click", f)
        })
        if (this.#tasks.length == 1) {
            setTimeout(this.#tasks[0], 0)
        }
    }

    // 菜单-警告对话框
    // 参数：信息文本 string
    static alert(text) {
        this.show("警告", text, ["确定"], () => { }, true)
    }

    // 菜单-确认对话框，点击确定或取消后调用回调函数，传递参数确认用户取向
    // 参数：信息文本 string，回调函数 func(bool)
    static confirm(text, callbackFunc) {
        this.show("提示", text, ["确定", "取消"], (i) => {
            callbackFunc(i == 0)
        })
    }

    // 菜单-输入对话框，点击确定或取消后调用回调函数，传递参数确认用户取向、用户输入
    // 参数：标题 string，信息文本 string，回调函数 func(bool, string)
    static input(title, text, callbackFunc) {
        this.#input.style.display = ""
        this.show(title, text, ["确定", "取消"], (i) => {
            this.#input.style.display = "none"
            let value = this.#input.value
            this.#input.value = ""
            callbackFunc(i == 0, value)
        })
    }
}
Menu.init(document.getElementById("menu"))

// ====================
// ==== 表格对象
// ====================
class Table {
    #root
    #title
    #head
    #body
    constructor(title, tags) {
        this.#root = document.createElement("section")

        this.#title = this.#root.appendChild(document.createElement("h2"))
        this.#title.innerText = title

        // this.#text = this.#root.appendChild(document.createElement("p"))
        // this.#text.innerText = text

        let table = this.#root.appendChild(document.createElement("table"))
        this.#head = table
            .appendChild(document.createElement("thead"))
            .appendChild(document.createElement("tr"))
        this.#body = table
            .appendChild(document.createElement("tbody"))

        let tr = this.#body.appendChild(document.createElement("tr"))
        tags.forEach((tag) => {
            this.#head.appendChild(document.createElement("th")).innerText = tag
        })
    }

    get rootElem() {
        return this.#root
    }







    static controlTable(clickElem) {


        Menu.show("表格操作", "你需要什么帮助？", [
            "删除该表格",
            "在尾部插入行",
            "在尾部插入列",
            "在头部插入行",
            "在头部插入列",
        ], (result) => {
            switch (result) {
                case 0:
                    Menu.confirm("删除后该表单相关数据将无法恢复，确认？", (ok) => {
                        if (ok) table.remove()
                    })
                case 1:
            }
        }, true)
    }



    static tableControlFunction(ev) {

    }
    static init(tableBox, addTableButton) {
        // 新建表格(事件触发函数)，触发后会询问表格的标题与表头，并添加填充好相关信息的表格
        addTableButton.addEventListener("click", () => {
            Menu.input("新建表格", "请输入该表格的标题：", (ok, value) => {
                if (ok && value != "") {
                    let title = value
                    Menu.input("新建表格", "请输入该表格的表头：\n输入格式为：表头1，表头2，表头3", (ok, value) => {
                        if (ok && value != "") {
                            let tags = value.match(/[^ \n,\t]+/g)
                            console.log(tags[0]);
                            let table = new Table(title, tags)
                            tableBox.appendChild(table.rootElem)
                        }
                    })
                }
            })
        })

        // 屏蔽浏览器右键菜单
        tableBox.oncontextmenu = () => { return false }


        // 节点文本编辑，触发后会将该节点子元素替换成文本框，待输入后保存信息
        // 焦点丢失与esc键信号都会让文本框视为放弃修改，仅当按下enter键才视为修改生效
        function editBox(editElem, checkfunc) {
            let text = editElem.innerText
            let editBox = document.createElement("input")
            editBox.className = "editBox"
            editBox.value = text
            function blur() {
                close()
            }
            function keydown(ev) {
                ev.stopPropagation()
                if (ev.keyCode == 13) close(true)
                else if (ev.keyCode == 27) close()
            }
            function close(save) {
                window.removeEventListener("blur", blur, true)
                window.removeEventListener("keydown", keydown, true)
                if (save) {
                    if (typeof checkfunc == "function") {
                        text = checkfunc(editBox.value.trim())
                    } else {
                        text = editBox.value.trim()
                    }
                }
                editElem.innerText = text
            }
            window.addEventListener("blur", blur, true)
            window.addEventListener("keydown", keydown, true)
            editElem.innerText = ""
            editElem.appendChild(editBox)
            editBox.focus()
        }

        // 表格控制，控制表格的数据，包括编辑、添加、删除等操作
        tableBox.addEventListener("mouseup", (ev) => {
            if (window.getSelection().toString() != "") {
                // 选择文本时不触发该事件
                return
            } else if (ev.button == 0) {
                // 点击鼠标左键时触发，编辑文本
                switch (ev.target.tagName) {
                    case "TH":
                    case "TD":
                    case "H2":
                    case "P":
                        Table.editBox(ev.target)
                }
            } else if (ev.button == 2) {
                // 点击鼠标右键键时触发
                let table = ev.target
                for (; table.tagName != "SECTION"; table = table.parentElement) {
                    if (table == tableBox) return
                }
                console.log(table);
            }
        })

    }
}

window.onload = function () {
    Table.init(
        document.getElementById("tableBox"),
        document.getElementById("addTable")
    )
}