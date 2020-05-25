import React from "react";
import App from "./app";
import { render, waitForElement } from "@testing-library/react";
import axios from "./axios";

jest.mock("./axios");

//Test 1
test("App shows nothing at first", async () => {
    axios.get.mockResolvedValue({
        data: {
            id: 1,
            first: "mortin",
            last: "pual",
            image_url: "dog.png",
        },
    });

    const { container } = render(<App />);
    await waitForElement(() => container.querySelector("div"));

    expect(container.children.length).toBe(1);
});
