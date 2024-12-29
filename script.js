const API_URL = "https://script.google.com/macros/s/AKfycbxYCzM3Av9DBwCyMVBFUf6wzeLX1bguL1W6MyV8mMFzqDkCZI_yTs0JUJfvIVF2tPjY/exec"; 

// دالة لإظهار الصفحة المحددة
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
}

// دالة لإضافة طالب جديد
document.getElementById('addStudentForm').addEventListener('submit', function(event) {
    event.preventDefault(); // منع إرسال النموذج الافتراضي

    const studentName = document.getElementById('studentName').value;
    const studentPhone = document.getElementById('studentPhone').value;
    const addStudentMessage = document.getElementById('addStudentMessage');

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'addStudent',
            name: studentName,
            phone: studentPhone
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addStudentMessage.textContent = data.message;
            document.getElementById('studentName').value = "";
            document.getElementById('studentPhone').value = "";
        } else {
            addStudentMessage.textContent = "خطأ: " + data.message;
        }
    })
    .catch(error => {
        addStudentMessage.textContent = "حدث خطأ أثناء إرسال الطلب: " + error;
    });
});

// دالة للبحث عن طالب موجود وتعبئة بياناته في صفحة إضافة التكليف
document.getElementById('addAssignmentForm').addEventListener('submit', function(event) {
    event.preventDefault(); // منع إرسال النموذج الافتراضي

    const studentName = document.getElementById('searchStudentName').value;
    const addAssignmentButton = document.getElementById('addAssignmentButton');
    const studentDetailsDiv = document.getElementById('studentDetails');

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'findStudent',
            name: studentName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            studentDetailsDiv.innerHTML = `
            <h4>بيانات الطالب</h4>
            <p>الاسم: ${data.student.name}</p>
            <p>رقم الطالب: ${data.student.id}</p>
            <p>رقم الهاتف: ${data.student.phone}</p>
            `;
            studentDetailsDiv.style.display = "block";
            addAssignmentButton.disabled = false;
            addAssignmentButton.onclick = function() {
                addAssignment(data.student.id);
            };
        } else {
            studentDetailsDiv.style.display = "none";
            studentDetailsDiv.innerHTML = `<p style="color:red;">${data.message}</p>`;
            addAssignmentButton.disabled = true;
        }
    })
    .catch(error => {
        studentDetailsDiv.innerHTML = `<p style="color:red;">حدث خطأ أثناء إرسال الطلب: ${error}</p>`;
        addAssignmentButton.disabled = true;
    });
});

// دالة لإضافة تكليف للطالب
function addAssignment(studentId) {
    const assignmentName = document.getElementById('assignmentName').value;
    const assignmentPrice = document.getElementById('assignmentPrice').value;
    const assignmentStartDate = document.getElementById('assignmentStartDate').value;
    const assignmentDueDate = document.getElementById('assignmentDueDate').value;
    const addAssignmentMessage = document.getElementById('addAssignmentMessage');

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'addAssignment',
            studentId: studentId,
            assignmentName: assignmentName,
            price: assignmentPrice,
            startDate: assignmentStartDate,
            dueDate: assignmentDueDate
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addAssignmentMessage.textContent = data.message;
            document.getElementById('assignmentName').value = "";
            document.getElementById('assignmentPrice').value = "";
            document.getElementById('assignmentStartDate').value = "";
            document.getElementById('assignmentDueDate').value = "";
        } else {
            addAssignmentMessage.textContent = "خطأ: " + data.message;
        }
    })
    .catch(error => {
        addAssignmentMessage.textContent = "حدث خطأ أثناء إرسال الطلب: " + error;
    });
}

// دالة لعرض التكاليف الخاصة بالطالب
document.getElementById('viewAssignmentsForm').addEventListener('submit', function(event) {
    event.preventDefault(); // منع إرسال النموذج الافتراضي

    const studentName = document.getElementById('viewStudentName').value;
    const assignmentsTable = document.getElementById('assignmentsTable');
    const viewAssignmentsMessage = document.getElementById('viewAssignmentsMessage');

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'findStudent',
            name: studentName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const studentId = data.student.id;
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getAssignments',
                    studentId: studentId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.assignments.length == 0) {
                        assignmentsTable.innerHTML = `<p>لا يوجد تكاليف مسجلة لهذا الطالب.</p>`;
                        return;
                    }
                    let tableHTML = `
                        <table>
                            <thead>
                                <tr>
                                    <th>اسم التكليف</th>
                                    <th>السعر</th>
                                    <th>تاريخ الإرسال</th>
                                    <th>تاريخ التسليم</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    data.assignments.forEach(assignment => {
                        tableHTML += `
                            <tr>
                                <td>${assignment.name}</td>
                                <td>${assignment.price}</td>
                                <td>${assignment.startDate}</td>
                                <td>${assignment.dueDate}</td>
                            </tr>
                        `;
                    });
                    tableHTML += `
                        </tbody>
                    </table>
                    `;
                    assignmentsTable.innerHTML = tableHTML;
                    viewAssignmentsMessage.textContent = "";
                } else {
                    assignmentsTable.innerHTML = "";
                    viewAssignmentsMessage.textContent = "خطأ: " + data.message;
                }
            })
            .catch(error => {
                assignmentsTable.innerHTML = "";
                viewAssignmentsMessage.textContent = "حدث خطأ أثناء إرسال الطلب: " + error;
            });
        } else {
            assignmentsTable.innerHTML = "";
            viewAssignmentsMessage.textContent = "خطأ: " + data.message;
        }
    })
    .catch(error => {
        assignmentsTable.innerHTML = "";
        viewAssignmentsMessage.textContent = "حدث خطأ أثناء إرسال الطلب: " + error;
    });
});
