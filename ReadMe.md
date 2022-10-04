# 获取收藏ids
b = []
document.querySelectorAll('.mainct .table td').forEach(v => {
    if (!v.className){b.push(v)}
})
b = b.slice(0, -2).map(v => v.innerText)

# 