// ========================================
// 1. FOOD WASTE CATEGORY CHART
// ========================================

function createWasteChart(categories, amounts) {
    const canvas = document.getElementById("wasteChart");

    if (!canvas) {
        console.log("Chart canvas not found.");
        return;
    }

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    if (!categories || categories.length === 0) {
        console.log("No waste data available.");
        return;
    }

    // Prevent duplicate charts
    const existingChart = Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: categories,

            datasets: [{
                label: "Food Waste (kg)",
                data: amounts,

                backgroundColor: [
                    "#2E7D32",
                    "#81C784",
                    "#FFB74D",
                    "#64B5F6",
                    "#BA68C8"
                ],

                borderColor: "#ffffff",
                borderWidth: 3
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    position: "bottom"
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ": " +
                                context.parsed + " kg";
                        }
                    }
                }
            }
        }
    });
}


// ========================================
// 2. NGO SERVICE CONFIGURATION
// ========================================

const serviceConfig = {
    donation: {
        title: "🍱 Food Donation",
        description: "Register surplus food for NGO review.",

        fields: [
            ["Donor Name", "text", "donor", true],
            ["Food Category", "select", "category", true],
            ["Quantity (kg)", "number", "quantity", true],
            ["Available Until", "date", "available_until", true],
            ["Storage and Handling Details", "textarea", "handling", true]
        ]
    },

    pickup: {
        title: "🚚 Pickup Request",
        description: "Enter details for a food collection request.",

        fields: [
            ["Contact Name", "text", "name", true],
            ["Pickup Area", "text", "area", true],
            ["Preferred Pickup Date", "date", "date", true],
            ["Donation Reference (optional)", "text", "reference", false]
        ]
    },

    volunteer: {
        title: "🙋 Volunteer Registration",
        description: "Register your interest in helping the community.",

        fields: [
            ["Full Name", "text", "name", true],
            ["Email", "email", "email", true],
            ["Phone", "tel", "phone", true],
            ["Area", "text", "area", true],
            ["Preferred Role", "select", "role", true]
        ]
    },

    partner: {
        title: "🏪 Restaurant Partnership",
        description: "Register a restaurant or catering business.",

        fields: [
            ["Business Name", "text", "business", true],
            ["Contact Person", "text", "contact", true],
            ["Email", "email", "email", true],
            ["Phone", "tel", "phone", true],
            ["Area", "text", "area", true]
        ]
    },

    inventory: {
        title: "📦 Food Inventory",
        description: "Enter details of available food.",

        fields: [
            ["Food Item", "text", "item", true],
            ["Quantity (kg)", "number", "quantity", true],
            ["Available Until", "date", "available_until", true]
        ]
    },

    community: {
        title: "🤝 Community Support",
        description: "Submit a household or community support enquiry.",

        fields: [
            ["Household or Organisation", "text", "name", true],
            ["Area", "text", "area", true],
            ["Number of People", "number", "people", true],
            ["Support Needed", "textarea", "support", true]
        ]
    },

    reports: {
        title: "📊 Impact Reports",
        description: "Choose the reporting period you want to review.",

        fields: [
            ["Reporting Period", "select", "period", true]
        ]
    },

    goals: {
        title: "🎯 Monthly Reduction Goal",
        description: "Set a target for reducing food waste.",

        fields: [
            ["Reduction Target (%)", "number", "target", true],
            ["Target Month", "month", "month", true]
        ]
    },

    awareness: {
        title: "📚 Awareness Centre",
        description: "Choose a topic to learn about.",

        fields: [
            ["Awareness Topic", "select", "topic", true]
        ]
    }
};


// ========================================
// 3. DROPDOWN OPTIONS
// ========================================

const serviceOptions = {
    category: [
        "Cooked Food",
        "Fruits and Vegetables",
        "Dairy Products",
        "Bakery Items",
        "Packaged Food",
        "Other"
    ],

    role: [
        "Food Collection",
        "Food Distribution",
        "Community Awareness",
        "Event Support",
        "Data Entry"
    ],

    period: [
        "Weekly",
        "Monthly",
        "Quarterly",
        "Yearly"
    ],

    topic: [
        "Food Storage",
        "Meal Planning",
        "Expiry Labels",
        "Safe Food Donation",
        "Reducing Household Waste"
    ]
};


// ========================================
// 4. OPEN SERVICE POPUP
// ========================================

function openService(serviceName) {
    const service = serviceConfig[serviceName];

    if (!service) {
        console.error("Unknown service:", serviceName);
        return;
    }

    const modal = document.getElementById("serviceModal");
    const fieldsContainer = document.getElementById("serviceFields");
    const form = document.getElementById("serviceForm");
    const message = document.getElementById("formMessage");

    if (!modal || !fieldsContainer || !form || !message) {
        console.error("Service popup HTML is missing.");
        return;
    }

    document.getElementById("modalTitle").textContent = service.title;

    document.getElementById("modalDescription").textContent =
        service.description;

    message.textContent = "";
    fieldsContainer.replaceChildren();
    form.reset();

    form.dataset.service = serviceName;

    service.fields.forEach(function(field) {
        const [labelText, type, name, required] = field;

        const label = document.createElement("label");
        label.appendChild(document.createTextNode(labelText));

        let input;

        if (type === "select") {
            input = document.createElement("select");

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Choose an option";

            input.appendChild(placeholder);

            (serviceOptions[name] || []).forEach(function(value) {
                const option = document.createElement("option");

                option.value = value;
                option.textContent = value;

                input.appendChild(option);
            });

        } else if (type === "textarea") {
            input = document.createElement("textarea");

        } else {
            input = document.createElement("input");
            input.type = type;
        }

        input.name = name;
        input.required = required;

        if (type === "number") {
            input.min = "0.01";
            input.step = "any";
        }

        label.appendChild(input);
        fieldsContainer.appendChild(label);
    });

    modal.hidden = false;
    document.body.style.overflow = "hidden";
}


// ========================================
// 5. CLOSE SERVICE POPUP
// ========================================

function closeService() {
    const modal = document.getElementById("serviceModal");

    if (modal) {
        modal.hidden = true;
        document.body.style.overflow = "";
    }
}


// ========================================
// 6. SERVICE FORM SUBMISSION
// ========================================

document.addEventListener("DOMContentLoaded", function() {

    const modal = document.getElementById("serviceModal");
    const form = document.getElementById("serviceForm");
    const message = document.getElementById("formMessage");

    if (modal) {
        modal.addEventListener("click", function(event) {
            if (event.target === modal) {
                closeService();
            }
        });
    }

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeService();
        }
    });

    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();

            if (!form.reportValidity()) {
                return;
            }

            const data = Object.fromEntries(
                new FormData(form).entries()
            );

            if (
                data.quantity !== undefined &&
                (!Number.isFinite(Number(data.quantity)) ||
                 Number(data.quantity) <= 0)
            ) {
                message.textContent =
                    "Please enter a quantity greater than zero.";
                return;
            }

            if (
                data.target !== undefined &&
                (!Number.isFinite(Number(data.target)) ||
                 Number(data.target) <= 0 ||
                 Number(data.target) > 100)
            ) {
                message.textContent =
                    "Please enter a target between 1% and 100%.";
                return;
            }

            message.textContent =
                "Demo successful! The form was validated, but the information has not been saved. Database integration is needed.";

            console.log(
                "NGO service demo:",
                form.dataset.service,
                data
            );
        });
    }
});