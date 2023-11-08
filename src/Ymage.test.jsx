import React from 'react';
import Ymage from './Ymage';
import {render, screen} from "@testing-library/react";
import { expect, test, describe } from 'vitest'

import 'intersection-observer';

const sample = "https://picsum.photos/200/300"

describe("Visibility", () => {

    render(<Ymage src="https://picsum.photos/200/300" onSize={(s)=>console.log("######Size")} />);
    
    test("Image placeholder spinner", async () => {
        const spinner = await screen.findByTestId("placeholder-spinner");
        expect(spinner).toBeDefined();
    });

    
 })
