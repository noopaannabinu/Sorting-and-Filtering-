// src/Edit.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MDBTable, MDBTableHead, MDBTableBody, MDBRow, MDBCol, MDBContainer, MDBBtn, MDBPagination, MDBPaginationItem, MDBPaginationLink, MDBBtnGroup
} from 'mdb-react-ui-kit';

import './LoginForm.css'; // Assuming you have some shared styles

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useUsersData = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const loadUsersData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users');
        setData(response.data);
        setOriginalData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error('Error loading users data:', error);
      }
    };

    loadUsersData();
  }, []);

  return { data, originalData, filteredData, setData, setOriginalData, setFilteredData };
};

const Edit = () => {
  const { data, originalData, filteredData, setData, setFilteredData } = useUsersData();
  const [value, setValue] = useState('');
  const [sortValue, setSortValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageLimit = 4;
  const debouncedSearchValue = useDebounce(value, 500);
  const sortOptions = ['name', 'email', 'phone', 'address', 'status'];
  

  const paginateData = useCallback(() => {
    const start = currentPage * pageLimit;
    const end = start + pageLimit;
    setData(filteredData.slice(start, end));
  }, [filteredData, currentPage, setData]);

  useEffect(() => {
    paginateData();
  }, [filteredData, currentPage, paginateData]);

  useEffect(() => {
    const searchData = originalData.filter(item => item.name.toLowerCase().startsWith(debouncedSearchValue.toLowerCase()));
    setFilteredData(searchData);
    setCurrentPage(0);
  }, [debouncedSearchValue, originalData, setFilteredData]);

  const handleReset = () => {
    setFilteredData(originalData);
    setValue('');
    setSortValue('');
    setCurrentPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = value.toLowerCase();
    const searchData = originalData.filter(item => item.name.toLowerCase().startsWith(searchValue));
    setFilteredData(searchData);
    setCurrentPage(0);
  };

  const handleSort = (e) => {
    const sortKey = e.target.value;
    setSortValue(sortKey);
    setValue(''); // Clear the search field

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1;
      if (a[sortKey] > b[sortKey]) return 1;
      return 0;
    });

    setFilteredData(sortedData);
    setCurrentPage(0);
  };

  const handleFilter = (status) => {
    setValue(''); // Clear the search field

    if (status) {
      const filteredData = originalData.filter(item => item.status.toLowerCase() === status.toLowerCase());
      setFilteredData(filteredData);
    } else {
      setFilteredData(originalData);
    }
    setCurrentPage(0);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredData.length / pageLimit);
    return (
      <MDBPagination className="mb-0">
        <MDBPaginationItem>
          <MDBBtn onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0 || filteredData.length === 0}>Previous</MDBBtn>
        </MDBPaginationItem>
        {Array.from({ length: totalPages }, (_, index) => (
          <MDBPaginationItem key={index} active={index === currentPage}>
            <MDBPaginationLink onClick={() => setCurrentPage(index)}>{index + 1}</MDBPaginationLink>
          </MDBPaginationItem>
        ))}
        <MDBPaginationItem>
          <MDBBtn onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages - 1 || filteredData.length === 0}>Next</MDBBtn>
        </MDBPaginationItem>
      </MDBPagination>
    );
  };

  return (
    <MDBContainer>
      <form style={{
        margin: 'auto',
        padding: '15px',
        maxWidth: '400px',
        alignContent: 'center'
      }} className="d-flex input-group w-auto" onSubmit={handleSearch}>
        <input type="text"
          className="form-control"
          placeholder="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <MDBBtn type="submit" color="dark">Search</MDBBtn>
        <MDBBtn className="mx-2" color="info" onClick={handleReset}>Reset</MDBBtn>
      </form>
      <div style={{ marginTop: '30px' }}></div>
      <h2 className="text-center">Search, Filter, Sort, and Pagination</h2>
      <MDBRow>
        <MDBCol size="12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h5>Sort By:</h5>
              <select style={{ width: '200px', borderRadius: '20px', height: '35px' }}
                onChange={handleSort}
                value={sortValue}>
                <option value="">Please Select Value</option>
                {sortOptions.map((item, index) => (<option value={item} key={index}>{item}</option>))}
              </select>
            </div>
            <div>
              <h5>Filter By Status:</h5>
              <MDBBtnGroup>
                <MDBBtn color="success" onClick={() => handleFilter('Active')}>Active</MDBBtn>
                <MDBBtn color="danger" style={{ marginLeft: '2px' }} onClick={() => handleFilter('Inactive')}>Inactive</MDBBtn>
              </MDBBtnGroup>
            </div>
          </div>
          <MDBTable>
            <MDBTableHead dark>
              <tr>
                <th scope="col">Id</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Address</th>
                <th scope="col">Status</th>
              </tr>
            </MDBTableHead>
            {data.length === 0 ? (
              <MDBTableBody className="align-center mb-0">
                <tr>
                  <td colSpan={6} className="text-center mb-0">No data found</td>
                </tr>
              </MDBTableBody>
            ) : (
              data.map((item, index) => (
                <MDBTableBody key={index}>
                  <tr>
                    <th scope="row">{currentPage * pageLimit + index + 1}</th>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>{item.address}</td>
                    <td>{item.status}</td>
                  </tr>
                </MDBTableBody>
              ))
            )}
          </MDBTable>
        </MDBCol>
      </MDBRow>
      <div
        style={{
          margin: 'auto',
          padding: '15px',
          maxWidth: '250px',
          alignContent: 'center'
        }}>{renderPagination()}</div>
    </MDBContainer>
  );
};

export default Edit;
