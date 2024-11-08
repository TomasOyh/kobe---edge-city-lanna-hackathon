#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use stylus_sdk::{prelude::*, alloy_primitives::U256};

sol_storage! {
    #[entrypoint]
    pub struct Counter {
        number: U256,
    }
}

#[external]
impl Counter {
    pub fn get_number(&self) -> Result<U256, Vec<u8>> {
        Ok(self.number.get())
    }

    pub fn set_number(&mut self, new_number: U256) -> Result<(), Vec<u8>> {
        self.number.set(new_number);
        Ok(())
    }
}